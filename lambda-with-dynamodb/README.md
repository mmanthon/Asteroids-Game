# NestJS Lambda Template configured with DynamoDB

NestJS Lambda Template configured with DynamoDB

## API Documentation via SwaggerUI
OpenApi Swagger UI is integrated into the Marketplace Submission API nestjs project. Once you have cloned the repo and have the app running visit http://localhost:3001/docs. You should see the Swagger UI. You can read more about OpenApi Swagger here (https://swagger.io/specification/).

## API route naming convention
When creating a new api route please follow our standard naming convention. To read up more about our standards, check out this link (https://restfulapi.net/resource-naming/).

## Logging
The template uses a Winston as the logging library. Currently all errors and application logs are printed to stdout, but this will change when it's time to go to production. You can read more about winston [here]((https://github.com/winstonjs/winston/tree/2.x)).

## PR Naming Convention
When making a pull request (PR), it's important to follow a consistent naming convention to help others understand the changes made. We use [@commitlint/config-conventional](https://www.conventionalcommits.org/en/v1.0.0/) to enforce a standardized naming convention.

Each PR name should follow this format:

```
type: header

<description>

<footer>
```

Here's an example of what a PR should look like:

```
feat: add ability to upload profile picture

This feature allows users to upload a profile picture to their account. The user can choose an image from their device and upload it to the server.

Closes #1234
```

## Commits
In order to maintain a clean and organized codebase, we use `@commitlint/config-conventional` to enforce a certain format for commit messages. This helps us to easily understand the purpose of each commit and makes it easier to track changes over time.

Here is an example of a properly formatted commit message:

```
feat: add new feature

```

The following table shows the different types that can be used in a PR and commit message and their impact on the package version:

| Type | Description | Version Impact |
| --- | --- | --- |
| feat | A new feature | Minor |
| fix | A bug fix | Patch |
| docs | Documentation changes | None |
| style | Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc) | None |
| refactor | A code change that neither fixes a bug nor adds a feature | None |
| perf | A code change that improves performance | Minor |
| test | Adding missing tests or correcting existing tests | None |
| ci | Changes to the build process or auxiliary tools and libraries such as documentation generation | None

For a major release, you will need to add "BREAKING CHANGE:" to the PR or Commit description. Example below
```
feat: allow user to upload email template

BREAKING CHANGE: existing user object is now used to validate uploaded template
```

By following this format, we can maintain a consistent and organized codebase, making it easier for everyone to understand the changes being made.

## Prerequisites
1. The api consumes the ISCx backend common utils as npm package. Since this package is restricted and limited to ISCx devs, developer will have to follow the steps listed below to generate and add a token to the .npmrc file:

First, Github requires a valid personal auth token in order to publish the package locally.Please add following 2 lines in .npmrc file and replace <token> with a valid token.

```
@ignidus:registry=https://npm.pkg.github.com/ignidus 
//npm.pkg.github.com/:_authToken=<token>
```
2. The api utilizes serverless cli as an option to run and test the application. Before getting started you will need to install serverless globally 
```
npm install -g serverless
```

## Connecting to DynamoDB
The aws user you are provisioned will have access to dynamodb. To utilize the access in the app, you will need to set your AWS_PROFILE to the profile you created for you dev aws user
```bash
export AWS_PROFILE=<your dev profile>
```

###### how to generate the personal token
1. Go to github settings page - https://github.com/settings/profile
2. Click on "Developer settings" from the left nav (all the way to the end). You can use this [url](https://github.com/settings/apps) as well 
3. Click on "Personal Access Tokens" -> "Tokens(classic)" from the left navigation.
4. Click on "Generate new token" on the top right and select "classic"
5. On the next page, fill out the details by adding note & expiration time (choose shorter time like 7 days)
6. Important thing on this page is to select the right scopes. Please select following scopes:
    - "read:packages"

7. Generate the token, copy in the .npmrc file. 

NOTE: Please make sure not to checkin the .npmrc file with YOUR personal token.

## Installation
```bash
$ npm install
```

## Environmental Variables
1. Create a .env file at the root of the project
2. The file need to include the below variables
3. If the variable doesn't have a default value, check AWS parameter store or secret mananger for the values (The variable will have the name of the secret or param where you can find the value)
```
PORT='3001'
AWS_REGION='us-west-2'
JWT_SECRET='value can be found at -> aws secret manager -> iscx/jwt-secret-key/dev'
```
  
## Running the app
```bash
# development
$ npm run start

# development serverelss
$ npm run start:serverless

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test
```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Versioning
[SemVer](http://semver.org/) is used for versioning.

## Authors

- **ISCx Team**

## License

Copyright (C) Integrated Specialty Coverages, LLC. All Rights Reserved.
