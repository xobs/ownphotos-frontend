FROM node:8-alpine
MAINTAINER Sean Cross <sean@xobs.io>

#RUN apt-get update && \
#    apt-get install -y curl && \
#    curl --silent --location https://deb.nodesource.com/setup_6.x | bash && \
#    apt-get install -y nodejs && \
#    apt-get remove --purge -y curl && \
#    rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

COPY . /usr/src/app
RUN \
    cp src/api_client/apiClientDeploy.js src/api_client/apiClient.js && \
    apk update && apk add git && \
    npm install && npm cache clean --force && npm run-script build

ENV CLI_WIDTH=80 \
    NODE_ENV=production \
    PUBLIC_URL= \
    HOST=0.0.0.0 \
    PORT=3000 \
    OWNPHOTOS_URL=http://localhost

EXPOSE 3000

CMD [ "npm", "start" ]
