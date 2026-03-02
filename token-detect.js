// token-detect.js
// Shared module for detecting token types by prefix pattern.

// Ordered: longer/more-specific prefixes first so they match before shorter ones.
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

export function detectTokenType(value) {
  if (!value) return 'Secret'
  for (const { prefix, type } of PATTERNS) {
    if (value.startsWith(prefix)) return type
  }
  return 'Secret'
}

export function formatPreview(value) {
  if (!value || value.length <= 6) return value || ''
  return value.slice(0, 6) + '...'
}
