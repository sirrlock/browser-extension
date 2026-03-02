// content.js
// Content script: fills input values and shows brief notifications.
// Receives messages from background.js.

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action === 'fill') {
    fillActiveElement(msg.value)
  }
  if (msg.action === 'notify') {
    showNotification(msg.message, msg.isError)
  }
})

function fillActiveElement(value) {
  const el = document.activeElement
  if (!el) return

  if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
    const nativeSetter = Object.getOwnPropertyDescriptor(
      el.tagName === 'INPUT' ? HTMLInputElement.prototype : HTMLTextAreaElement.prototype,
      'value'
    )?.set
    if (nativeSetter) {
      nativeSetter.call(el, value)
    } else {
      el.value = value
    }
    el.dispatchEvent(new Event('input', { bubbles: true }))
    el.dispatchEvent(new Event('change', { bubbles: true }))
    return
  }

  if (el.isContentEditable) {
    el.textContent = value
    el.dispatchEvent(new Event('input', { bubbles: true }))
    return
  }
}

function showNotification(message, isError = false) {
  const toast = document.createElement('div')
  toast.textContent = message
  Object.assign(toast.style, {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    zIndex: '2147483647',
    padding: '10px 16px',
    borderRadius: '8px',
    fontSize: '13px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontWeight: '500',
    color: '#fff',
    backgroundColor: isError ? '#ef4444' : '#184f8d',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    transition: 'opacity 0.3s ease',
    opacity: '0',
  })
  document.body.appendChild(toast)

  requestAnimationFrame(() => {
    toast.style.opacity = '1'
  })

  setTimeout(() => {
    toast.style.opacity = '0'
    setTimeout(() => toast.remove(), 300)
  }, 2500)
}
