// options.js
// Settings page logic: load, save, and toggle mode-dependent fields.

const DEFAULT_SETTINGS = {
  mode: 'cloud',
  sirrUrl: 'https://sirr.sirrlock.com',
  apiKey: '',
  org: '',
  defaultTtl: 86400,
  defaultMaxReads: 1,
}

const modeEl = document.getElementById('mode')
const urlField = document.getElementById('url-field')
const sirrUrlEl = document.getElementById('sirr-url')
const apiKeyEl = document.getElementById('api-key')
const orgEl = document.getElementById('org')
const ttlEl = document.getElementById('ttl')
const maxReadsEl = document.getElementById('max-reads')
const saveBtn = document.getElementById('save')
const savedMsg = document.getElementById('saved-msg')
const cloudGet = document.getElementById('cloud-get')
const cloudHint = document.getElementById('cloud-hint')
const selfhostedHint = document.getElementById('selfhosted-hint')

function updateModeUI() {
  const isSelfHosted = modeEl.value === 'selfhosted'
  urlField.classList.toggle('visible', isSelfHosted)
  cloudGet.classList.toggle('hidden', isSelfHosted)
  cloudHint.style.display = isSelfHosted ? 'none' : 'block'
  selfhostedHint.classList.toggle('visible', isSelfHosted)
}

modeEl.addEventListener('change', updateModeUI)

chrome.storage.local.get('settings', ({ settings }) => {
  const s = { ...DEFAULT_SETTINGS, ...settings }
  modeEl.value = s.mode
  sirrUrlEl.value = s.mode === 'selfhosted' ? s.sirrUrl : 'http://0.0.0.0:39999'
  apiKeyEl.value = s.apiKey
  orgEl.value = s.org
  ttlEl.value = s.defaultTtl
  maxReadsEl.value = s.defaultMaxReads
  updateModeUI()
})

saveBtn.addEventListener('click', () => {
  const mode = modeEl.value
  const settings = {
    mode,
    sirrUrl: mode === 'selfhosted'
      ? (sirrUrlEl.value.trim().replace(/\/+$/, '') || 'http://0.0.0.0:39999')
      : 'https://sirr.sirrlock.com',
    apiKey: apiKeyEl.value.trim(),
    org: orgEl.value.trim(),
    defaultTtl: Math.max(60, parseInt(ttlEl.value, 10) || 86400),
    defaultMaxReads: Math.max(1, parseInt(maxReadsEl.value, 10) || 1),
  }
  chrome.storage.local.set({ settings }, () => {
    savedMsg.classList.add('show')
    setTimeout(() => savedMsg.classList.remove('show'), 2000)
  })
})
