#!/bin/bash
# Script to upload environment variables to Vercel
# Usage: ./scripts/setup-vercel-env.sh

set -e

ENV_FILE=".env.production"

if [ ! -f "$ENV_FILE" ]; then
    echo "Error: $ENV_FILE not found"
    exit 1
fi

echo "📦 Uploading environment variables to Vercel..."
echo "Environment: Production & Preview"
echo ""

# Read each line from .env.production and upload to Vercel
while IFS='=' read -r key value; do
    # Skip comments and empty lines
    [[ "$key" =~ ^#.*$ ]] && continue
    [[ -z "$key" ]] && continue

    # Remove quotes from value
    value=$(echo "$value" | sed 's/^"\(.*\)"$/\1/')

    # Skip if value is pending
    if [[ "$value" == "PENDING_"* ]]; then
        echo "⚠️  Skipping $key (pending value)"
        continue
    fi

    echo "✓ Adding $key"

    # Add to Production
    echo "$value" | vercel env add "$key" production --sensitive 2>&1 | grep -v "Error: The environment variable" || true

    # Add to Preview
    echo "$value" | vercel env add "$key" preview --sensitive 2>&1 | grep -v "Error: The environment variable" || true

done < <(grep -v '^#' "$ENV_FILE" | grep -v '^$')

echo ""
echo "✅ Done! Environment variables uploaded to Vercel"
echo ""
echo "Next steps:"
echo "1. Run: vercel --prod"
echo "2. Your app will deploy with the new environment variables"
