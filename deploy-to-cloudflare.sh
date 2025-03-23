#!/bin/bash

# Script to build and deploy to Cloudflare Pages without needing local wrangler
# This works by generating the _worker.js file that Cloudflare Pages expects

echo "🔨 Building the Astro site..."
npm run build

echo "📂 Creating the Cloudflare Worker script..."

# Create the functions directory in dist if it doesn't exist
mkdir -p dist/functions

# Copy the API function to the right location
cp -r functions/* dist/functions/

echo "✅ Build complete."
echo ""
echo "To deploy to Cloudflare Pages:"
echo "1. Push this repo to GitHub"
echo "2. Connect your repository in the Cloudflare Pages dashboard"
echo "3. Set the following build configurations:"
echo "   - Build command: npm run build"
echo "   - Build output directory: dist"
echo ""
echo "4. Add the following environment variables in Cloudflare dashboard:"
echo "   - API_KEY: your-api-key"
echo ""
echo "5. Create the required resources in Cloudflare and update wrangler.toml:"
echo "   - KV namespace: wrangler kv:namespace create \"SCORES_KV\""
echo "   - D1 database: wrangler d1 create score_database"
echo ""
echo "Done! Your site is ready for deployment." 