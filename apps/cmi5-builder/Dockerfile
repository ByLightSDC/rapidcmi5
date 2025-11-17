FROM  dsoharbor.cybercents.com/hub/node:22.14.0

RUN apt-get update && \
    apt-get install -y jq curl && \
    rm -rf /var/lib/apt/lists/*

COPY dist/apps/cc-cmi5-player /home/work/player
COPY dist/apps/cmi5-builder /home/work/builder

WORKDIR /home/work/builder

RUN chmod +x main.js
RUN npm install

ENTRYPOINT ["node", "main.js"]