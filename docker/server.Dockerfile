FROM node:12-alpine

WORKDIR /usr/src/app

ARG REACT_APP_AUTH0_CLIENT_ID=setme
ENV REACT_APP_AUTH0_CLIENT_ID=${REACT_APP_AUTH0_CLIENT_ID}

ARG REACT_APP_AUTH0_DOMAIN=setme
ENV REACT_APP_AUTH0_DOMAIN=${REACT_APP_AUTH0_DOMAIN}

ARG REACT_APP_API_BASE_URL=/
ENV REACT_APP_API_BASE_URL=${REACT_APP_API_BASE_URL}

ARG DATABASE_URL=setme
ENV DATABASE_URL=${DATABASE_URL}
ARG DATABASE_SSL=setme
ENV DATABASE_SSL=${DATABASE_SSL}

COPY server/package.json server/yarn.lock ./server/
COPY client/package.json client/yarn.lock ./client/

WORKDIR /usr/src/app/server
RUN yarn install --pure-lockfile

WORKDIR /usr/src/app/client
RUN yarn install --pure-lockfile

WORKDIR /usr/src/app
COPY . .

WORKDIR /usr/src/app/server
RUN yarn run build

WORKDIR /usr/src/app/client
RUN yarn run build

WORKDIR /usr/src/app/server

EXPOSE 6969

CMD [ "node", "dist/server.js" ]