// options.js
// Settings page logic: load, save, and toggle mode-dependent fields.

const DEFAULT_SETTINGS = {
  mode: 'cloud',
  sirrUrl: 'https://sirr.sirrlock.com',
  apiKey: '',
  defaultTtl: 86400,
  defaultMaxReads: 1,
}

const modeEl = document.getElementById('mode')
const urlField = document.getElementById('url-field')
const sirrUrlEl = document.getElementById('sirr-url')
const apiKeyEl = document.getElementById('api-key')
const ttlEl = document.getElementById('ttl')
const maxReadsEl = document.getElementById('max-reads')
const saveBtn = document.getElementById('save')
const savedMsg = document.getElementById('saved-msg')

modeEl.addEventListener('change', () => {
  urlField.classList.toggle('visible', modeEl.value === 'selfhosted')
})

chrome.storage.local.get('settings', ({ settings }) => {
  const s = { ...DEFAULT_SETTINGS, ...settings }
  modeEl.value = s.mode
  sirrUrlEl.value = s.mode === 'selfhosted' ? s.sirrUrl : ''
  apiKeyEl.value = s.apiKey
  ttlEl.value = s.defaultTtl
  maxReadsEl.value = s.defaultMaxReads
  urlField.classList.toggle('visible', s.mode === 'selfhosted')
})

saveBtn.addEventListener('click', () => {
  const mode = modeEl.value
  const settings = {
    mode,
    sirrUrl: mode === 'selfhosted'
      ? sirrUrlEl.value.replace(/\/+$/, '')
      : 'https://sirr.sirrlock.com',
    apiKey: apiKeyEl.value.trim(),
    defaultTtl: Math.max(60, parseInt(ttlEl.value, 10) || 86400),
    defaultMaxReads: Math.max(1, parseInt(maxReadsEl.value, 10) || 1),
  }
  chrome.storage.local.set({ settings }, () => {
    savedMsg.classList.add('show')
    setTimeout(() => savedMsg.classList.remove('show'), 2000)
  })
})
