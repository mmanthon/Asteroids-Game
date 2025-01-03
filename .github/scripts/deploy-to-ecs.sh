#!/bin/bash
set -e

# Environment variable validation
if [ -z "$ENVIRONMENT" ]; then
  echo "Error: ENVIRONMENT variable is not set. Please set it and try again."
  exit 1
fi
if [ -z "$AWS_REGION" ]; then
  echo "Error: AWS_REGION variable is not set. Please set it and try again."
  exit 1
fi
if [ -z "$AWS_ACCOUNT_ID" ]; then
  echo "Error: AWS_ACCOUNT_ID variable is not set. Please set it and try again."
  exit 1
fi
if [ -z "$NPM_TOKEN" ]; then
  echo "Error: NPM_TOKEN variable is not set. Please set it and try again."
  exit 1
fi
if [ -z "$GITHUB_SHA" ]; then
  echo "Error: GITHUB_SHA variable is not set. Please set it and try again."
  exit 1
fi

echo "Starting deployment for environment: $ENVIRONMENT"

# Create a temporary copy of config.json and replace <account-id>
TEMP_CONFIG=$(mktemp)
cp .github/config.json "$TEMP_CONFIG"
sed -i "s/<account-id>/$AWS_ACCOUNT_ID/g" "$TEMP_CONFIG"
echo "Temporary configuration file created with updated account ID."

# Login to Amazon ECR
echo "Logging in to Amazon ECR..."
aws ecr get-login-password --region "$AWS_REGION" | docker login --username AWS --password-stdin "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
echo "Successfully logged in to Amazon ECR."

# Load environment-specific configuration
echo "Loading environment-specific configuration..."
CONFIG=$(jq -r ".${ENVIRONMENT}" "$TEMP_CONFIG")
CLUSTER=$(jq -r ".cluster" "$TEMP_CONFIG")

SERVICENAME=$(echo "$CONFIG" | jq -r '.serviceName')
LOG_GROUP=$(echo "$CONFIG" | jq -r '.logGroup')
CPU=$(echo "$CONFIG" | jq -r '.cpu')
MEMORY=$(echo "$CONFIG" | jq -r '.memory')
ENVIRONMENT=$(echo "$CONFIG" | jq -r '.environment')
SECRETS=$(echo "$CONFIG" | jq -r '.secrets')
ROLE_ARN=$(echo "$CONFIG" | jq -r '.role')
echo "Configuration loaded for service: $SERVICENAME"
echo "Cluster loaded: $CLUSTER"
echo "Role ARN: $ROLE_ARN"

# Set up .npmrc
echo "Setting up .npmrc for npm authentication..."
echo "@ignidus:registry=https://npm.pkg.github.com/ignidus" > .npmrc
echo "//npm.pkg.github.com/:_authToken=$NPM_TOKEN" >> .npmrc
echo ".npmrc setup completed."

# Build and tag image
echo "Building Docker image..."
DOCKER_BUILDKIT=1 docker build . -t "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${SERVICENAME}:${GITHUB_SHA}" --secret id=npmrc,src=./.npmrc
echo "Docker image built successfully."

# Push Docker image to Amazon ECR
echo "Pushing Docker image to Amazon ECR..."
docker push "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${SERVICENAME}:${GITHUB_SHA}"
echo "Docker image pushed successfully."

# Update task definition
echo "Updating ECS task definition..."
jq --arg IMAGE_URI "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${SERVICENAME}:${GITHUB_SHA}" \
   --arg SERVICE_NAME "$SERVICENAME" \
   --arg LOG_GROUP "$LOG_GROUP" \
   --arg CPU "$CPU" \
   --arg MEMORY "$MEMORY" \
   --arg ROLE_ARN "$ROLE_ARN" \
   --argjson NEW_ENVIRONMENT "$ENVIRONMENT" \
   --argjson NEW_SECRETS "$SECRETS" \
   '.containerDefinitions[0].image = $IMAGE_URI |
    .containerDefinitions[0].logConfiguration.options."awslogs-group" = $LOG_GROUP |
    .containerDefinitions[0].environment += $NEW_ENVIRONMENT |
    .containerDefinitions[0].secrets += $NEW_SECRETS |
    .taskRoleArn = $ROLE_ARN |
    .executionRoleArn = $ROLE_ARN |
    .family = $SERVICE_NAME |
    .containerDefinitions[0].name = $SERVICE_NAME |
    .cpu = $CPU |
    .memory = $MEMORY' \
   .github/task_definition_template.json > updated_task_definition.json
echo "Task definition updated successfully."

# Echo the new task definition
echo "New Task Definition:"
cat updated_task_definition.json

# Register the new task definition
echo "Registering the updated task definition..."
TASK_DEFINITION=$(aws ecs register-task-definition \
  --cli-input-json file://updated_task_definition.json)
TASK_DEFINITION_ARN=$(echo "$TASK_DEFINITION" | jq -r '.taskDefinition.taskDefinitionArn')
echo "Task definition registered successfully: $TASK_DEFINITION_ARN"

# Deploy to ECS
echo "Deploying service to ECS..."
aws ecs update-service \
  --cluster "$CLUSTER" \
  --service "$SERVICENAME" \
  --task-definition "$TASK_DEFINITION_ARN" \
  --force-new-deployment > /dev/null
echo "Service deployment initiated. Waiting for stability..."

# Wait for ECS service stability
if aws ecs wait services-stable --cluster "$CLUSTER" --services "$SERVICENAME"; then
  echo "Service is stable!"
else
  echo "Service stabilization failed. Please check the ECS service logs for details."
  exit 1
fi

# Cleanup
rm "$TEMP_CONFIG"
echo "Temporary configuration file removed."
rm ./.npmrc
echo ".npmrc file removed."