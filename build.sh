#!/bin/bash
set -e

mkdir -p packages/Vibe-Workflow/packages/workflow-builder/dist
mkdir -p packages/Open-Poe-AI/packages/agents/dist

npx tailwindcss -i packages/Vibe-Workflow/packages/workflow-builder/src/tailwind.css -o packages/Vibe-Workflow/packages/workflow-builder/dist/tailwind.css --minify
npx tailwindcss -i packages/Open-Poe-AI/packages/agents/src/tailwind.css -o packages/Open-Poe-AI/packages/agents/dist/tailwind.css --minify

cd packages/Vibe-Workflow/packages/workflow-builder && npx babel src --out-dir dist --extensions .js,.jsx && cd ../../../../
cd packages/Open-Poe-AI/packages/agents && npx babel src --out-dir dist --extensions .js,.jsx && cd ../../../

npm run build:studio
next build
