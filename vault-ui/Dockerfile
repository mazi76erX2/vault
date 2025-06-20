FROM node:18-alpine

RUN mkdir -p /dependencies
COPY ./dist/dependencies/generic-components-1.0.0.tgz ./dependencies

#COPY ./dist/dockerstart.sh /dockerstart.sh

WORKDIR /vaultui

COPY dist ./

RUN npm install

EXPOSE 8081

RUN chmod +x dockerstart.sh
ENTRYPOINT ["/bin/sh", "dockerstart.sh"]
