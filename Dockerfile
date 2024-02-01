# from alpine latest
FROM node:bookworm

# Set working directory
WORKDIR /app

# Copy initial necessary files to container
COPY package.json \
package-lock.json \
astro.config.mjs \
svelte.config.js \
tailwind.config.cjs \
drizzle.config.ts \
tsconfig.json ./

# Install dependencies
RUN npm install

# Copy all files from src/
COPY src ./src
# Copy public folder
COPY public ./public

# build drizzle schema
RUN npm run generate

# and build webapp
RUN npm run build

# Start Astro
CMD ["npm", "run", "dist"]
