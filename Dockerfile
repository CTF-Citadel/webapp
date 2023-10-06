# from alpine latest
FROM node:slim

# Set working directory
WORKDIR /app

# Copy initial necessary files to container
COPY package.json \
package-lock.json \
astro.config.mjs \
svelte.config.js \
tailwind.config.cjs \
schema.prisma \
tsconfig.json .

# Install dependencies
RUN npm install

# Copy all files from src/
COPY src ./src
# Copy public folder
COPY public ./public

# and build
RUN npm run build

# Start Astro
CMD ["HOST=0.0.0.0", "PORT=8085", "node", "./dist/server/entry.mjs"]
