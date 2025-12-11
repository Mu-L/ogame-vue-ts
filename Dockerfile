FROM node:latest

RUN mkdir -p /workspace

WORKDIR /workspace

RUN npm config set registry https://registry.npmmirror.com

RUN cd /workspace

RUN git clone https://github.com/setube/ogame-vue-ts.git

RUN mv ./ogame-vue-ts/* . ; rm -rf ./ogame-vue-ts/

RUN npm install -g pnpm ; pnpm install ; npx vite build

CMD ["npx", "vite", "preview", "--host", "0.0.0.0", "--port", "25121"]