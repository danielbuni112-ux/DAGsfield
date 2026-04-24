#!/bin/bash
set -euo pipefail

ROOT="$(pwd)"

echo "==> Root: $ROOT"

# Ensure dist directories exist before build scripts write into them.
mkdir -p "$ROOT/packages/Vibe-Workflow/packages/workflow-builder/dist"
mkdir -p "$ROOT/packages/Open-Poe-AI/packages/agents/dist"
mkdir -p "$ROOT/packages/studio/dist"

# Resolve a binary: prefer the workspace's own node_modules/.bin (where
# v3 tailwindcss/babel live when the root hoists a different version),
# fall back to the root node_modules/.bin.
resolve_bin() {
  local workspace_dir="$1"
  local name="$2"
  if [ -x "$workspace_dir/node_modules/.bin/$name" ]; then
    echo "$workspace_dir/node_modules/.bin/$name"
  elif [ -x "$ROOT/node_modules/.bin/$name" ]; then
    echo "$ROOT/node_modules/.bin/$name"
  else
    echo "ERROR: could not find '$name' binary for $workspace_dir" >&2
    return 1
  fi
}

build_workspace() {
  local dir="$1"
  local label="$2"
  echo "==> Building $label ($dir)"
  local tailwind_bin babel_bin
  tailwind_bin="$(resolve_bin "$dir" tailwindcss)"
  babel_bin="$(resolve_bin "$dir" babel)"
  (
    cd "$dir"
    "$tailwind_bin" -i ./src/tailwind.css -o ./dist/tailwind.css --minify
    "$babel_bin" src --out-dir dist --extensions .js,.jsx
  )
}

# DO NOT run `npm install` inside these subpackages. Root `npm install`
# already installed their deps via the workspaces field, and the git
# submodules contain their own package.json files with workspaces
# (`client`, `server`) that don't exist locally — running npm install
# inside them triggers "could not determine executable to run".

build_workspace "$ROOT/packages/Vibe-Workflow/packages/workflow-builder" "workflow-builder"
build_workspace "$ROOT/packages/Open-Poe-AI/packages/agents" "ai-agent"

# Studio already has a working build script in its package.json
# and its workspace lives directly under the root, so run it via npm.
echo "==> Building studio"
cd "$ROOT"
npm run build:studio

echo "==> Running next build"
cd "$ROOT"
npx --no-install next build
