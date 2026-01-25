FROM node:18-alpine

#COPY ./dist/dockerstart.sh /dockerstart.sh

WORKDIR /vaultui

COPY dist ./

RUN npm install

EXPOSE 8081

RUN chmod +x dockerstart.sh
ENTRYPOINT ["/bin/sh", "dockerstart.sh"]
