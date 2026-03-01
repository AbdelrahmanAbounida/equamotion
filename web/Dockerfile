FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* pnpm-lock.yaml* ./

RUN if [ -f pnpm-lock.yaml ]; then \
      npm install -g pnpm && pnpm install --frozen-lockfile; \
    else \
      npm ci; \
    fi

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
