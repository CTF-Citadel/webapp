# from slim 22 latest
FROM node:22-slim

# Set working directory
WORKDIR /app

# make folders
RUN mkdir -p /data
RUN mkdir -p /config

# Copy initial necessary files to container
COPY app/package.json \
app/package-lock.json \
app/.npmrc \
app/astro.config.mjs \
app/svelte.config.js \
app/tailwind.config.cjs \
app/drizzle.config.ts \
app/tsconfig.json ./

# Install dependencies
RUN npm install

# Copy all files from src/
COPY app/src ./src
# Copy public folder
COPY app/public ./public
# copy other files
COPY misc/entrypoint.sh /
COPY misc/default-config.toml /config

# build drizzle schema
RUN npm run generate

# and build webapp
RUN npm run build

# Start Astro
CMD ["/entrypoint.sh"]
