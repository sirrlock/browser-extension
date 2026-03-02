# Sirr Browser Extension — Claude Development Guide

## Purpose

Manifest V3 WebExtension for Chrome and Firefox. Right-click to store selected text
as an ephemeral Sirr secret. Right-click input fields to paste and burn stored secrets.

## Stack

- Vanilla JavaScript (no build step, no bundler)
- Manifest V3 (service worker architecture)
- Two manifests: `manifest.json` (Chrome) and `manifest.firefox.json` (Firefox)

## Structure

```
manifest.json              # Chrome MV3 manifest (service_worker)
manifest.firefox.json      # Firefox MV3 manifest (scripts array + gecko settings)
background.js              # Service worker: store/paste/burn flows, context menu setup
content.js                 # Content script: fills input fields, shows toast notifications
options.html / options.js  # Settings page: server URL, API key, org ID, TTL, max reads
token-detect.js            # Detects token types (ghp_, AKIA, sk-, etc.) for auto-labeling
icons/                     # Extension icons (16, 48, 128px)
```

## Key Rules

- Both manifests must stay in sync: permissions, icons, content_scripts, web_accessible_resources
- Chrome uses `"service_worker"` field; Firefox uses `"scripts"` array in background
- Firefox manifest includes `browser_specific_settings.gecko` with extension ID
- No build step — JS is shipped as-is; keep files small and dependency-free
- `content.js` must not access `chrome.storage` directly — message-pass to background
- Never log API key values to console

## Build / Release

Push to `main` triggers CI:
1. Runs unit tests
2. Sets version to `0.1.<build_number>`
3. Packs Chrome zip (using `manifest.json`)
4. Packs Firefox zip (swaps in `manifest.firefox.json` → renamed `manifest.json`)
5. Creates GitHub Release with both zips attached

## Pre-Commit Checklist

1. **README.md** — New settings or flows?
2. **CLAUDE.md** — New constraints?
