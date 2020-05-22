FROM node:10
WORKDIR /usr/src/app
# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

# RUN npm install
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY . .

# RUN npm install knex -g
ENV SES_PASSWORD=${SES_PASSWORD}, SES_KEY=${SES_KEY}

EXPOSE 3000
CMD [ "npm", "start" ]