// background.js
// Service worker: manages context menus, Sirr API calls, badge, and local metadata.

// ─── Defaults ───────────────────────────────────────────

const DEFAULT_SETTINGS = {
  mode: 'cloud',
  sirrUrl: 'https://sirr.sirrlock.com',
  apiKey: '',
  org: '',
  defaultTtl: 86400,
  defaultMaxReads: 1,
}

// ─── Helpers ────────────────────────────────────────────

async function getSettings() {
  const { settings } = await chrome.storage.local.get('settings')
  return { ...DEFAULT_SETTINGS, ...settings }
}

async function getSecrets() {
  const { secrets } = await chrome.storage.local.get('secrets')
  return secrets || []
}

async function saveSecrets(secrets) {
  await chrome.storage.local.set({ secrets })
}

async function updateBadge() {
  const secrets = await getSecrets()
  const count = secrets.length
  chrome.action.setBadgeText({ text: count > 0 ? String(count) : '' })
  chrome.action.setBadgeBackgroundColor({ color: '#184f8d' })
}

// ─── Token Detection (inline — service workers can't use ES module imports) ──

const PATTERNS = [
  { prefix: 'github_pat_', type: 'GitHub PAT' },
  { prefix: 'ghp_',        type: 'GitHub Token' },
  { prefix: 'gho_',        type: 'GitHub OAuth' },
  { prefix: 'sk-proj-',    type: 'OpenAI Project Key' },
  { prefix: 'sk-',         type: 'OpenAI Key' },
  { prefix: 'AKIA',        type: 'AWS Access Key' },
  { prefix: 'glpat-',      type: 'GitLab Token' },
  { prefix: 'dckr_pat_',   type: 'Docker Token' },
  { prefix: 'sirr_lic_',   type: 'Sirr License' },
  { prefix: 'npm_',        type: 'npm Token' },
  { prefix: 'pypi-',       type: 'PyPI Token' },
  { prefix: 'SG.',         type: 'SendGrid Key' },
  { prefix: 'xoxb-',       type: 'Slack Bot Token' },
  { prefix: 'xoxp-',       type: 'Slack User Token' },
]

function detectTokenType(value) {
  if (!value) return 'Secret'
  for (const { prefix, type } of PATTERNS) {
    if (value.startsWith(prefix)) return type
  }
  return 'Secret'
}

function formatPreview(value) {
  if (!value || value.length <= 6) return value || ''
  return value.slice(0, 6) + '...'
}

function secretsUrl(settings, id) {
  const base = settings.sirrUrl.replace(/\/+$/, '')
  return id ? `${base}/secrets/${id}` : `${base}/secrets`
}

// ─── Sirr API ───────────────────────────────────────────

async function storeSecret(value) {
  const settings = await getSettings()
  const url = secretsUrl(settings)
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        value,
        ttl_seconds: settings.defaultTtl,
        max_reads: settings.defaultMaxReads,
      }),
    })
    if (!res.ok) {
      console.error(`[Sirr] Store failed: ${res.status}`)
      return null
    }
    const data = await res.json()
    return data.id ?? null
  } catch (err) {
    console.error('[Sirr] Store error:', err)
    return null
  }
}

async function readSecret(id) {
  const settings = await getSettings()
  const url = secretsUrl(settings, encodeURIComponent(id))
  try {
    const res = await fetch(url)
    if (!res.ok) return null
    const data = await res.json()
    return data.value ?? null
  } catch (err) {
    console.error('[Sirr] Read error:', err)
    return null
  }
}

async function burnSecret(id) {
  const settings = await getSettings()
  const url = secretsUrl(settings, encodeURIComponent(id))
  try {
    const res = await fetch(url, { method: 'DELETE' })
    return res.ok || res.status === 404
  } catch (err) {
    console.error('[Sirr] Burn error:', err)
    return false
  }
}

// ─── Context Menu ───────────────────────────────────────

async function rebuildContextMenu() {
  await chrome.contextMenus.removeAll()

  chrome.contextMenus.create({
    id: 'sirr-store',
    title: 'Store to Sirr',
    contexts: ['selection'],
  })

  chrome.contextMenus.create({
    id: 'sirr-paste-parent',
    title: 'Sirr',
    contexts: ['editable'],
  })

  const secrets = await getSecrets()
  if (secrets.length === 0) {
    chrome.contextMenus.create({
      id: 'sirr-empty',
      parentId: 'sirr-paste-parent',
      title: 'No secrets stored',
      enabled: false,
      contexts: ['editable'],
    })
  } else {
    for (const secret of secrets) {
      chrome.contextMenus.create({
        id: `sirr-paste-${secret.id}`,
        parentId: 'sirr-paste-parent',
        title: `${secret.hostname} — ${secret.type} (${secret.preview})`,
        contexts: ['editable'],
      })
    }
  }
}

// ─── Event Handlers ─────────────────────────────────────

chrome.runtime.onInstalled.addListener(async (details) => {
  await rebuildContextMenu()
  await updateBadge()

  // Open options on first install so user can configure the server URL
  if (details.reason === 'install') {
    chrome.runtime.openOptionsPage()
  }
})

// Clicking the extension icon opens options (no popup configured)
chrome.action.onClicked.addListener(() => {
  chrome.runtime.openOptionsPage()
})

chrome.runtime.onStartup.addListener(async () => {
  await rebuildContextMenu()
  await updateBadge()
})

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'sirr-store') {
    const selectedText = info.selectionText?.trim()
    if (!selectedText) return

    let hostname = 'unknown'
    try {
      hostname = new URL(tab.url).hostname
    } catch { /* keep 'unknown' */ }

    const type = detectTokenType(selectedText)
    const preview = formatPreview(selectedText)
    const timestamp = Math.floor(Date.now() / 1000)

    const id = await storeSecret(selectedText)
    if (!id) {
      chrome.tabs.sendMessage(tab.id, {
        action: 'notify',
        message: 'Failed to store secret. Check extension settings.',
        isError: true,
      })
      return
    }

    const secrets = await getSecrets()
    secrets.push({ id, hostname, type, preview, createdAt: timestamp })
    await saveSecrets(secrets)
    await rebuildContextMenu()
    await updateBadge()

    chrome.tabs.sendMessage(tab.id, {
      action: 'notify',
      message: `Stored: ${type} (${preview})`,
    })
    return
  }

  if (info.menuItemId.startsWith('sirr-paste-')) {
    const secretId = info.menuItemId.replace('sirr-paste-', '')

    const value = await readSecret(secretId)
    if (!value) {
      chrome.tabs.sendMessage(tab.id, {
        action: 'notify',
        message: 'Secret not found or already burned.',
        isError: true,
      })
      const secrets = await getSecrets()
      await saveSecrets(secrets.filter((s) => s.id !== secretId))
      await rebuildContextMenu()
      await updateBadge()
      return
    }

    chrome.tabs.sendMessage(tab.id, { action: 'fill', value })

    await burnSecret(secretId)

    const secrets = await getSecrets()
    const meta = secrets.find((s) => s.id === secretId)
    await saveSecrets(secrets.filter((s) => s.id !== secretId))
    await rebuildContextMenu()
    await updateBadge()

    chrome.tabs.sendMessage(tab.id, {
      action: 'notify',
      message: `Pasted and burned: ${meta?.type || 'Secret'}`,
    })
  }
})

chrome.storage.onChanged.addListener((changes) => {
  if (changes.secrets) {
    rebuildContextMenu()
    updateBadge()
  }
})
