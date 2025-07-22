#!/bin/bash

# Build Angular project
echo "Building Angular app..."
npm run build:prod 

# Rename dist folder if needed
BUILD_PATH=dist
TARGET_PATH=dist_ssr

echo "Backup existing build folder..."
mv $TARGET_PATH bkp/$TARGET_PATH-`date +"%y-%m-%d"`

echo "Renaming new build folder..."
# rm -rf $TARGET_PATH
mv $BUILD_PATH $TARGET_PATH

# Start the static server
echo "Starting static server on port 4000..."
pm2 reload ecosystem.config.js --only cf-ui-ssr || pm2 start ecosystem.config.js --only cf-ui-ssr
echo "Static server started successfully."
