#!/bin/bash

echo "🔧 Setting up environment..."

# Prompt for DB username
read -p "Enter your PostgreSQL username: " db_user

# Create .env file from template
cp env_example .env

# Replace the default username with the user's input
sed -i '' "s/user@localhost/${db_user}@localhost/" .env

# Run setup commands
echo "📦 Installing dependencies..."
npm install

echo "⚙️ Generating Prisma client..."
npx prisma generate

echo "Setup complete. .env configured with username '${db_user}'"
echo "Run server with npm run dev"