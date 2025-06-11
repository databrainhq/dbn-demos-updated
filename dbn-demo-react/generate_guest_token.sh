#!/bin/bash

# DataBrain Guest Token Generator - Developer Friendly Version
# Requires your API token and client ID

echo "🔑 DataBrain Guest Token Generator"
echo "=================================="
echo ""

# Prompt for API token
read -p "Enter your DataBrain API Token: " API_TOKEN

if [ -z "$API_TOKEN" ]; then
    echo "❌ Error: API token is required!"
    exit 1
fi

# Prompt for client ID
read -p "Enter your Client ID: " CLIENT_ID

if [ -z "$CLIENT_ID" ]; then
    echo "❌ Error: Client ID is required!"
    exit 1
fi

# Use a default data app name (you can customize this)
DATA_APP_NAME="demo-app"

echo ""
echo "📋 Parameters:"
echo "   API Token: ${API_TOKEN:0:20}..."
echo "   Client ID: $CLIENT_ID"
echo "   Data App Name: $DATA_APP_NAME"
echo ""
echo "🚀 Creating guest token..."
echo ""

# Make the API call
RESPONSE=$(curl -s -X POST "https://api.usedatabrain.com/api/v2/guest-token/create" \
  -H "Authorization: Bearer $API_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"clientId\": \"$CLIENT_ID\",
    \"data_app_name\": \"$DATA_APP_NAME\"
  }")

# Check if jq is available for pretty printing
if command -v jq >/dev/null 2>&1; then
    echo "📄 API Response:"
    echo "$RESPONSE" | jq '.'
    
    # Extract and display the guest token prominently
    GUEST_TOKEN=$(echo "$RESPONSE" | jq -r '.guest_token // .token // empty')
    if [ ! -z "$GUEST_TOKEN" ] && [ "$GUEST_TOKEN" != "null" ]; then
        echo ""
        echo "✅ SUCCESS! Your credentials for the demo app:"
        echo "================================================"
        echo "Guest Token: $GUEST_TOKEN"
        echo "Client ID:   $CLIENT_ID"
        echo "================================================"
        echo ""
        echo "🎯 Next steps:"
        echo "1. Copy the Guest Token above"
        echo "2. Copy the Client ID above" 
        echo "3. Open http://localhost:5173"
        echo "4. Paste both values into the form"
        echo "5. Add your Dashboard ID and click 'Load Dashboard'"
    else
        echo ""
        echo "❌ Failed to create guest token. Common issues:"
        echo "   • Invalid API token"
        echo "   • Data app name doesn't exist"
        echo "   • API endpoint might be different for your instance"
        echo ""
        echo "📄 Full response above for debugging"
    fi
else
    echo "📄 API Response:"
    echo "$RESPONSE"
    echo ""
    echo "💡 Install 'jq' for better JSON formatting: brew install jq"
fi

echo "" 