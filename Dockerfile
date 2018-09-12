FROM node:8.9.4

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package*.json /usr/src/app/
ENV NODE_TLS_REJECT_UNAUTHORIZED=0
##RUN npm config set registry http://registry.npmjs.org/
RUN npm config set strict-ssl false && npm install --only=production
COPY . /usr/src/app

EXPOSE 3000
CMD [ "npm", "start" ]