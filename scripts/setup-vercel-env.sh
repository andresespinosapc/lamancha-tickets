#!/bin/bash
# Script to upload environment variables to Vercel
# Usage: ./scripts/setup-vercel-env.sh

set -euo pipefail

ENV_FILE=".env.production"

# Counters for tracking
SUCCESS_COUNT=0
SKIP_COUNT=0
FAIL_COUNT=0

if [ ! -f "$ENV_FILE" ]; then
    echo "❌ Error: $ENV_FILE not found"
    exit 1
fi

echo "📦 Uploading environment variables to Vercel..."
echo "Environment: Production & Preview"
echo ""

# Function to add env var to a specific environment
add_env_var() {
    local key=$1
    local value=$2
    local env=$3

    if echo "$value" | vercel env add "$key" "$env" --sensitive >/dev/null 2>&1; then
        return 0
    else
        # Check if it already exists (which is fine)
        if vercel env ls 2>&1 | grep -q "$key.*$env"; then
            return 0
        fi
        return 1
    fi
}

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
        ((SKIP_COUNT++))
        continue
    fi

    # Skip if value is empty
    if [[ -z "$value" ]]; then
        echo "⚠️  Skipping $key (empty value)"
        ((SKIP_COUNT++))
        continue
    fi

    echo "📤 Adding $key..."

    # Track success for both environments
    prod_success=false
    preview_success=false

    # Add to Production
    if add_env_var "$key" "$value" "production"; then
        prod_success=true
    fi

    # Add to Preview
    if add_env_var "$key" "$value" "preview"; then
        preview_success=true
    fi

    # Report results
    if $prod_success && $preview_success; then
        echo "   ✅ Added to Production & Preview"
        ((SUCCESS_COUNT++))
    elif $prod_success || $preview_success; then
        echo "   ⚠️  Partially added (check manually)"
        ((FAIL_COUNT++))
    else
        echo "   ❌ Failed to add"
        ((FAIL_COUNT++))
    fi

done < <(grep -v '^#' "$ENV_FILE" | grep -v '^$')

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Summary:"
echo "   ✅ Successfully added: $SUCCESS_COUNT"
echo "   ⚠️  Skipped: $SKIP_COUNT"
echo "   ❌ Failed: $FAIL_COUNT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ $FAIL_COUNT -gt 0 ]; then
    echo "⚠️  Some variables failed to upload. Please check the errors above."
    exit 1
fi

echo "✅ Done! Environment variables uploaded to Vercel"
echo ""
echo "Next steps:"
echo "1. Run: vercel --prod"
echo "2. Your app will deploy with the new environment variables"
