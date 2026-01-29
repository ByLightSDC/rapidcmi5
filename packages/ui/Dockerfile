FROM dsoharbor.cybercents.com/hub/node:22-alpine as builder

ARG BUILD_ID=0
ENV BUILD_ID=$BUILD_ID
ARG GIT_BRANCH=unknown
ENV GIT_BRANCH=$GIT_BRANCH
ARG GIT_COMMIT=unknown
ENV GIT_COMMIT=$GIT_COMMIT

# Production Container
FROM dsoharbor.cybercents.com/hub/nginx:stable-alpine
WORKDIR /usr/share/nginx/html

RUN apk update && \
    apk upgrade && \
    rm -rf /var/cache/apk/*

# Copy built app

COPY apps/rapid-cmi5-electron-frontend/config/default.conf /etc/nginx/conf.d/default.conf
COPY dist/storybook/ui-components-branded .
