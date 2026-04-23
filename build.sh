#!/bin/bash
set -e

mkdir -p packages/Vibe-Workflow/packages/workflow-builder/dist
mkdir -p packages/Open-Poe-AI/packages/agents/dist

cd packages/Vibe-Workflow/packages/workflow-builder
npm install
./node_modules/.bin/tailwindcss -i ./src/tailwind.css -o ./dist/tailwind.css --minify
./node_modules/.bin/babel src --out-dir dist --extensions .js,.jsx
cd ../../../../

cd packages/Open-Poe-AI/packages/agents
npm install
./node_modules/.bin/tailwindcss -i ./src/tailwind.css -o ./dist/tailwind.css --minify
./node_modules/.bin/babel src --out-dir dist --extensions .js,.jsx
cd ../../../

npm run build:studio
next build
