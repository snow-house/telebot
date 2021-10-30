FROM node:12-alpine

WORKDIR /app

# copy package.json and .lock file
COPY package.json ./
COPY package-lock.json ./
# copy src
COPY src ./

# Download pictures 
RUN wget -O blank.jpg https://telebot-tag.ap-south-1.linodeobjects.com/blank.jpg
RUN wget -O fbimg.jpg https://telebot-tag.ap-south-1.linodeobjects.com/fbimg.jpg
RUN wget -O vvimg.jpg https://telebot-tag.ap-south-1.linodeobjects.com/vvimg.jpg

# install deps
RUN npm install

# run
CMD ["npm", "start"]
