# from alpine latest
FROM alpine:latest

# Add npm
RUN apk update && \
    apk add npm curl

# add deno
RUN curl -fsSL https://deno.land/x/install/install.sh | sh
RUN export DENO_INSTALL="/root/.deno"
RUN export PATH="$DENO_INSTALL/bin:$PATH"

# Set working directory
WORKDIR /app

# Copy initial necessary files to container
COPY package.json .
COPY package-lock.json .
COPY astro.config.mjs .
COPY svelte.config.js .
COPY tailwind.config.cjs .
COPY tsconfig.json .

# Copy all files from src/
COPY src ./src

# Install dependencies and build
RUN npm install
RUN npm run build

# Start Astro with deno backend
CMD ["deno", "run", "--unsafely-ignore-certificate-errors", "--allow-net", "--allow-read", "--allow-env", "./dist/server/entry.mjs"]
