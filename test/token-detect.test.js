// test/token-detect.test.js
import { detectTokenType, formatPreview } from '../token-detect.js'
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

describe('detectTokenType', () => {
  it('detects GitHub PAT', () => {
    assert.equal(detectTokenType('ghp_a3f8KzXyz1234567890abcdefghijk'), 'GitHub Token')
  })
  it('detects GitHub OAuth token', () => {
    assert.equal(detectTokenType('gho_sometoken123'), 'GitHub OAuth')
  })
  it('detects GitHub fine-grained PAT', () => {
    assert.equal(detectTokenType('github_pat_abc123def456'), 'GitHub PAT')
  })
  it('detects AWS access key', () => {
    assert.equal(detectTokenType('AKIAIOSFODNN7EXAMPLE'), 'AWS Access Key')
  })
  it('detects OpenAI project key over generic sk-', () => {
    assert.equal(detectTokenType('sk-proj-abc123'), 'OpenAI Project Key')
  })
  it('detects generic OpenAI key', () => {
    assert.equal(detectTokenType('sk-abc123def456'), 'OpenAI Key')
  })
  it('detects GitLab token', () => {
    assert.equal(detectTokenType('glpat-xxxxxxxxxxxxxxxxxxxx'), 'GitLab Token')
  })
  it('detects Docker token', () => {
    assert.equal(detectTokenType('dckr_pat_abc123'), 'Docker Token')
  })
  it('detects Sirr license', () => {
    assert.equal(detectTokenType('sirr_lic_abc123def456abc123def456abc123def456abcd'), 'Sirr License')
  })
  it('detects npm token', () => {
    assert.equal(detectTokenType('npm_abcdef1234567890'), 'npm Token')
  })
  it('detects PyPI token', () => {
    assert.equal(detectTokenType('pypi-AgEIcHlwaS5vcmc...'), 'PyPI Token')
  })
  it('detects SendGrid key', () => {
    assert.equal(detectTokenType('SG.abc123.def456'), 'SendGrid Key')
  })
  it('detects Slack bot token', () => {
    assert.equal(detectTokenType('xoxb-123-456-abc'), 'Slack Bot Token')
  })
  it('detects Slack user token', () => {
    assert.equal(detectTokenType('xoxp-123-456-abc'), 'Slack User Token')
  })
  it('returns Secret for unknown patterns', () => {
    assert.equal(detectTokenType('some-random-string-1234'), 'Secret')
  })
  it('returns Secret for empty string', () => {
    assert.equal(detectTokenType(''), 'Secret')
  })
})

describe('formatPreview', () => {
  it('returns first 6 chars with ellipsis', () => {
    assert.equal(formatPreview('ghp_a3f8KzXyz1234567890'), 'ghp_a3...')
  })
  it('returns full string if 6 chars or fewer', () => {
    assert.equal(formatPreview('abc'), 'abc')
  })
  it('handles empty string', () => {
    assert.equal(formatPreview(''), '')
  })
})
