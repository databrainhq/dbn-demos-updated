#!/bin/bash

# Quick Guest Token Generator - Two parameter version
# Usage: ./quick_token.sh YOUR_API_TOKEN YOUR_CLIENT_ID

API_TOKEN="$1"
CLIENT_ID="$2"

if [ -z "$API_TOKEN" ] || [ -z "$CLIENT_ID" ]; then
    echo "Usage: ./quick_token.sh YOUR_API_TOKEN YOUR_CLIENT_ID"
    echo ""
    echo "Example: ./quick_token.sh abc123-token-xyz my-client-001"
    exit 1
fi

echo "🔑 Generating guest token..."
echo "   Client ID: $CLIENT_ID"
echo "   API Token: ${API_TOKEN:0:20}..."
echo ""

# Make the API call and capture response
RESPONSE=$(curl -s -X POST "https://api.usedatabrain.com/api/v2/guest-token/create" \
  -H "Authorization: Bearer $API_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"clientId\": \"$CLIENT_ID\", \"data_app_name\": \"demo-app\"}")

# Try to extract guest token with jq, fallback to showing raw response
if command -v jq >/dev/null 2>&1; then
    GUEST_TOKEN=$(echo "$RESPONSE" | jq -r '.guest_token // .token // empty')
    if [ ! -z "$GUEST_TOKEN" ] && [ "$GUEST_TOKEN" != "null" ] && [ "$GUEST_TOKEN" != "ERROR" ]; then
        echo "✅ SUCCESS!"
        echo "Guest Token: $GUEST_TOKEN"
        echo "Client ID: $CLIENT_ID"
    else
        echo "❌ ERROR - Raw response:"
        echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
    fi
else
    echo "📄 Response: $RESPONSE"
    echo ""
    echo "💡 Install 'jq' for better parsing: brew install jq"
fi 