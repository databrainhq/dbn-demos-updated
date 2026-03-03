#!/bin/bash

echo "



 DataBrain Demo Setup Script"
echo "================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "


 Node.js is not installed. Please install Node.js first."
    echo "   Download from: https://nodejs.org/"
    exit 1
fi

echo "


 Node.js found: $(node --version)"
echo ""

# Step 1: Install frontend dependencies
echo "



 Step 1/4: Installing frontend dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "


 Failed to install frontend dependencies"
    exit 1
fi
echo "


 Frontend dependencies installed"
echo ""

# Step 2: Install backend dependencies
echo "



 Step 2/4: Installing backend dependencies..."
cd backend
npm install
if [ $? -ne 0 ]; then
    echo "


 Failed to install backend dependencies"
    cd ..
    exit 1
fi
cd ..
echo "


 Backend dependencies installed"
echo ""

# Step 3: Check for .env file
echo "



 Step 3/4: Checking configuration..."
if [ ! -f "backend/.env" ]; then
    echo "





  No .env file found in backend/"
    echo ""
    echo "



 Creating .env file from template..."
    cp backend/env.example backend/.env
    echo "


 Created backend/.env file"
    echo ""
    echo "





  IMPORTANT: You need to configure your DataBrain credentials!"
    echo ""
    echo "You have THREE options to configure:"
    echo ""
    echo "Option 1: Interactive CLI Setup (easiest) ✨"
    echo "   When you start the backend server, it will automatically prompt you"
    echo "   to enter your credentials if they're not configured."
    echo ""
    echo "Option 2: Settings UI"
    echo "   1. Start the application (continue with this script)"
    echo "   2. Go to Settings tab in the UI"
    echo "   3. Enter your credentials there"
    echo ""
    echo "Option 3: Edit the .env file manually"
    echo "   1. Open: backend/.env"
    echo "   2. Add your DataBrain API Token"
    echo "   3. Add your DataBrain Data App Name"
    echo ""
    read -p "Press Enter to continue..."
else
    echo "


 Found existing .env file"
    
    # Check if .env has required values
    if grep -q "your-api-token-here" backend/.env || grep -q "your-data-app-name" backend/.env; then
        echo "





  .env file needs configuration"
        echo ""
        echo "Please configure your DataBrain credentials using one of these options:"
        echo "   

� Option 1: Interactive CLI prompts when starting backend server (easiest)"
        echo "   

� Option 2: Use Settings tab in the UI after starting the app"
        echo "   

� Option 3: Edit backend/.env file manually"
        echo ""
    else
        echo "


 Configuration looks good"
    fi
fi
echo ""

# Step 4: Instructions
echo "



 Step 4/4: Setup complete!"
echo ""
echo "












































































































































"
echo "



 Next Steps:"
echo "












































































































































"
echo ""
echo "1



��  Get your DataBrain credentials:"
echo "   

� Login to DataBrain dashboard"
echo "   

� Go to Settings 


 API Keys"
echo "   

� Copy your API Token"
echo "   

� Note your Data App Name"
echo ""
echo "2



��  Start the backend server (in a new terminal):"
echo "   cd backend"
echo "   npm start"
echo ""
echo "3



��  Start the frontend app (in another terminal):"
echo "   npm run dev"
echo ""
echo "4



��  Open your browser:"
echo "   http://localhost:5173"
echo ""
echo "5



��  Configure credentials (if not done via CLI):"
echo "   The backend server will prompt you interactively, OR"
echo "   

� Click Settings tab in the UI and enter credentials, OR"
echo "   

� Edit backend/.env file manually"
echo ""
echo "












































































































































"
echo ""
echo "



 Tip: You can also edit backend/.env file directly"
echo "



 Full documentation: README.md"
echo ""
echo "Happy dashboarding! 



"
