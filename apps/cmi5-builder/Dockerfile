# Build the Nx targets before building this image. See README.md.
FROM node:22-alpine AS dependencies

WORKDIR /opt/cmi5/builder
COPY dist/apps/cmi5-builder/package.json ./
RUN npm install --omit=dev --no-audit --no-fund \
    && npm cache clean --force

FROM node:22-alpine

ENV NODE_ENV=production
WORKDIR /workspace

COPY --from=dependencies --chown=node:node /opt/cmi5/builder/node_modules /opt/cmi5/builder/node_modules
COPY --chown=node:node dist/apps/cmi5-builder/ /opt/cmi5/builder/
COPY --chown=node:node dist/apps/cc-cmi5-player/ /opt/cmi5/player/
COPY --chown=node:node apps/cmi5-builder/docker-entrypoint.sh /usr/local/bin/cmi5-builder

RUN mkdir -p /output && chown node:node /output \
    && chmod +x /usr/local/bin/cmi5-builder

USER node
ENTRYPOINT ["cmi5-builder"]
CMD ["--help"]
