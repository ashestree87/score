# Cloudflare Bindings for Score Quiz App

This document explains how to set up and use Cloudflare bindings with the Score Quiz application.

## Overview

The Score Quiz app uses Cloudflare Pages for hosting the static site and Cloudflare Functions (formerly Pages Functions) for serverless API endpoints. These Functions can access various Cloudflare resources through bindings.

## Required Bindings

The application uses the following bindings:

1. **KV Namespace (SCORES_KV)**: Stores quiz submission data
2. **Environment Variables (API_KEY)**: Configuration values 
3. **D1 Database (DB)**: Optional - for more structured data storage

## Setup Instructions

### 1. Create KV Namespace

```bash
# Install Wrangler CLI if you don't have it
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Create a KV namespace
wrangler kv:namespace create "SCORES_KV"
wrangler kv:namespace create "SCORES_KV" --preview
```

Note the IDs returned by these commands and add them to your `wrangler.toml` file.

### 2. Create D1 Database (Optional)

```bash
# Create a D1 database
wrangler d1 create score_database

# Create the submissions table
wrangler d1 execute score_database --file=./schema.sql
```

Create a `schema.sql` file in your project with:

```sql
CREATE TABLE IF NOT EXISTS submissions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  score INTEGER,
  data TEXT,
  created_at TEXT
);
```

Add the D1 database ID to your `wrangler.toml` file.

### 3. Update wrangler.toml

Replace the placeholder values in `wrangler.toml` with your actual IDs:

```toml
[[kv_namespaces]]
binding = "SCORES_KV"
id = "your-actual-kv-id"
preview_id = "your-actual-preview-kv-id"

[[d1_databases]]
binding = "DB"
database_name = "score_database"
database_id = "your-actual-d1-id"
```

### 4. Environment Variables

Set your environment variables in the Cloudflare Dashboard:
1. Go to Cloudflare Pages
2. Select your project
3. Navigate to Settings > Environment variables
4. Add variables like `API_KEY`

## Local Development

For local development with Cloudflare bindings:

```bash
# Start local development server with wrangler
npx wrangler pages dev dist --binding API_KEY=test_key_local
```

## Deployment

When deploying to Cloudflare Pages, your bindings will be available in the Functions automatically based on your `wrangler.toml` configuration and the environment variables set in the Cloudflare Dashboard.

## Accessing Bindings in Functions

Bindings are accessed through the `env` object in the `context` parameter:

```javascript
export async function onRequest(context) {
  const { env } = context;
  
  // Access KV Namespace
  await env.SCORES_KV.put('key', 'value');
  
  // Access environment variable
  const apiKey = env.API_KEY;
  
  // Access D1 Database
  const { results } = await env.DB.prepare('SELECT * FROM submissions LIMIT 10').all();
}
```

## Troubleshooting

- **KV/D1 Access Errors**: Ensure your binding IDs are correct in `wrangler.toml`
- **Missing Environment Variables**: Check they're set correctly in the Cloudflare Dashboard
- **Local Development Issues**: Use `wrangler pages dev` with `--binding` flags to test locally 