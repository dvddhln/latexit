FROM ubuntu:18.04

# Install tex, xetex
# Install font-awesome

ARG DEBIAN_FRONTEND=noninteractive

USER root

RUN apt-get update
RUN apt-get install -y \
    fonts-font-awesome \
    inkscape \
    texlive-full \
    texlive-xetex \
    unzip \
    curl \
 && apt-get clean \
 && rm -f /var/lib/apt/lists/*_dists_*

RUN rm /bin/sh && ln -s /bin/bash /bin/sh

# nvm environment variables
RUN mkdir /usr/local/nvm
ENV NVM_DIR /usr/local/nvm
ENV NVM_INSTALL_PATH $NVM_DIR/versions/node/$NODE_VERSION
ENV NODE_VERSION v14.16.1
RUN curl --silent -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.2/install.sh | bash

# install node and npm
RUN source $NVM_DIR/nvm.sh \
    && nvm install $NODE_VERSION \
    && nvm alias default $NODE_VERSION \
    && nvm use default

# add node and npm to path so the commands are available
ENV NODE_PATH $NVM_DIR/$NODE_VERSION/lib/node_modules
ENV PATH $NVM_DIR/versions/node/$NODE_VERSION/bin:$PATH

RUN npm -v

WORKDIR /usr/src/app

COPY ./ ./

RUN npm install

RUN npm run build

COPY server.js server.js
EXPOSE 8080

CMD [ "node", "server.js" ]