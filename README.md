# Sirr Browser Extension

Right-click to store and paste ephemeral secrets via [Sirr](https://github.com/sirrlock/sirr). Chrome + Firefox, Manifest V3.

## Install

### Chrome (Development)

1. Download the latest `sirr-chrome-*.zip` from [Releases](../../releases/latest)
2. Unzip the file
3. Open `chrome://extensions/`
4. Enable "Developer mode"
5. Click "Load unpacked" and select the unzipped folder

### Firefox (Development)

1. Download the latest `sirr-firefox-*.zip` from [Releases](../../releases/latest)
2. Open `about:debugging` → **This Firefox** → **Load Temporary Add-on**
3. Select the zip file

## Usage

- **Store:** Select text on any page → right-click → "Store to Sirr" → sends value-only to `POST /secrets` → server returns a hex ID and shareable URL
- **Paste:** Right-click an input field → "Sirr" → click a secret → value is fetched by ID (`GET /secrets/{id}`), fills in, and the secret burns

No API key is required for public push/read operations. The extension stores the server-generated hex ID locally for retrieval.

## Settings

Click the extension icon → Options to configure:
- **Mode:** sirrlock.com (cloud) or self-hosted
- **API Key:** (optional) Only needed for org-scoped or authenticated endpoints
- **Organization ID:** (optional) Routes secrets to `/orgs/{id}/secrets` for multi-tenant deployments
- **Default TTL:** How long secrets live (default: 24h)
- **Default max reads:** Read limit before burn (default: 1)

Public push and read operations work without an API key or org ID.

## Project Structure

```
sirr-extension/
├── manifest.json              # Chrome (MV3) manifest
├── manifest.firefox.json      # Firefox (MV3) manifest
├── background.js              # Service worker: store/paste/burn flows
├── content.js                 # Content script: input filling + notifications
├── options.html / options.js  # Settings page
├── token-detect.js            # Token type detection (ghp_, AKIA, sk-, etc.)
├── icons/                     # Extension icons
└── .github/workflows/         # CI: test, pack Chrome + Firefox, release
```

### Manifest Differences

Two manifests for browser compatibility:
- `manifest.json` — Chrome — uses `"service_worker"` field
- `manifest.firefox.json` — Firefox — uses `"scripts"` array, includes `browser_specific_settings.gecko`

Both must be kept in sync for permissions, icons, content scripts, and other fields.

## Building

Push to `main` triggers the CI workflow which:
1. Runs unit tests
2. Sets version to `0.1.<build_number>`
3. Packs Chrome extension (using `manifest.json`)
4. Packs Firefox extension (using `manifest.firefox.json` → renamed to `manifest.json`)
5. Creates a GitHub Release with both zip files attached

## License

MIT
