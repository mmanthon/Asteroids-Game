###################
# BUILD FOR LOCAL DEVELOPMENT
###################
FROM node:18-alpine As development
WORKDIR /usr/src/app
COPY . .
RUN npm pkg delete scripts.prepare
RUN --mount=type=secret,id=npmrc,target=/root/.npmrc npm ci 


###################
# BUILD FOR PRODUCTION
###################
FROM node:18-alpine As build
WORKDIR /usr/src/app
COPY --chown=node:node package*.json ./
COPY --chown=node:node --from=development /usr/src/app/node_modules ./node_modules
COPY --chown=node:node . .
RUN npm run build
ENV NODE_ENV production
RUN npm pkg delete scripts.prepare
RUN --mount=type=secret,id=npmrc,target=/root/.npmrc npm ci --omit=dev && npm cache clean --force
USER node

###################
# PRODUCTION
###################
FROM node:18-alpine As production
ENV NODE_ENV production
COPY --chown=node:node --from=build /usr/src/app/node_modules ./node_modules
COPY --chown=node:node --from=build /usr/src/app/dist ./dist
RUN apk add libcap && setcap 'cap_net_bind_service=+ep' `readlink -f \`which node\``
CMD [ "node", "dist/src/main.js" ]