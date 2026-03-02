# Sirr Browser Extension

Right-click to store and paste ephemeral secrets via [Sirr](https://sirr.dev).

## Install (Development)

1. Open `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked" and select this directory

## Usage

- **Store:** Select text on any page → right-click → "Store to Sirr"
- **Paste:** Right-click an input field → "Sirr" → click a secret → value fills in, secret burns

## Settings

Click the extension icon → Options to configure:
- **Mode:** sirrlock.com (cloud) or self-hosted
- **API Key:** Your Sirr API key
- **Default TTL:** How long secrets live (default: 24h)
- **Default max reads:** Read limit before burn (default: 1)
