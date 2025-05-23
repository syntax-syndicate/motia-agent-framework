#!/bin/bash

rm -rf dist

echo "Building CommonJS version..."
npx tsc --project tsconfig.build.json --outDir dist/cjs --module CommonJS

echo "Building ESM version..."
npx tsc --project tsconfig.build.json --outDir dist/esm --module ES2020

echo "Building type declarations..."
npx tsc --emitDeclarationOnly --declaration --outDir dist/types

echo "Copying templates and Python files..."
sh scripts/move-templates.sh
sh scripts/move-python.sh

echo "Copying dot files..."
sh scripts/move-dot-files.sh

echo "Making CLI files executable..."
chmod +x dist/cjs/cli.js
chmod +x dist/esm/cli.js

echo "Build completed successfully!" 