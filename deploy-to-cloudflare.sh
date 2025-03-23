#!/bin/bash

# Script to build and deploy to Cloudflare Pages without needing local wrangler
# This works by generating the _worker.js file that Cloudflare Pages expects

# Check if wrangler.toml exists, if not create from example
if [ ! -f wrangler.toml ]; then
  echo "⚠️ wrangler.toml not found. Creating from example file..."
  if [ -f wrangler.example.toml ]; then
    cp wrangler.example.toml wrangler.toml
    echo "⚠️ Please edit wrangler.toml to add your actual IDs and secrets!"
    echo "⚠️ Press Ctrl+C to cancel, or any key to continue with placeholder values."
    read -n 1 -s
  else
    echo "❌ wrangler.example.toml not found. Cannot continue."
    exit 1
  fi
fi

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
echo "4. Add the environment variables and bindings in Cloudflare dashboard:"
echo "   - API_KEY: your-api-key"
echo "   - ADMIN_TOKEN: your-admin-token"
echo "   - KV Namespace: Bind 'SCORE_KV' to your 'score_kv' namespace"
echo "   - D1 Database: Bind 'SCORE_DB' to your 'score_db' database" 
echo ""
echo "5. Create the required resources in Cloudflare if they don't exist:"
echo "   - KV namespace: wrangler kv:namespace create \"score_kv\""
echo "   - D1 database: wrangler d1 create score_db"
echo ""
echo "⚠️ IMPORTANT: Do not commit your wrangler.toml file to Git as it contains sensitive information."
echo ""
echo "Done! Your site is ready for deployment." 