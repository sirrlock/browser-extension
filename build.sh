#!/usr/bin/env bash
set -euo pipefail

DIR="$(cd "$(dirname "$0")" && pwd)"

# Build Firefox version — copies all source files and swaps in the Firefox manifest
rm -rf "$DIR/build-firefox"
mkdir -p "$DIR/build-firefox/icons"

cp "$DIR/manifest.firefox.json" "$DIR/build-firefox/manifest.json"
cp "$DIR/background.js" "$DIR/build-firefox/"
cp "$DIR/content.js" "$DIR/build-firefox/"
cp "$DIR/token-detect.js" "$DIR/build-firefox/"
cp "$DIR/options.html" "$DIR/build-firefox/"
cp "$DIR/options.js" "$DIR/build-firefox/"
cp "$DIR/icons/"*.png "$DIR/build-firefox/icons/"

echo "Firefox build ready at: $DIR/build-firefox/"
echo "Load it in about:debugging → This Firefox → Load Temporary Add-on → select build-firefox/manifest.json"
