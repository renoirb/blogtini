/**
 * Dress up all the things
 */

import { boolean } from 'https://renoirb.github.io/site-assets/static/esm-modules/stringificator-boolean.mjs'

window.booleaner = boolean

const siteRootBaseUrl = await import.meta.resolve('./theme.js').replace('theme.js', '');

console.log('RBx blogtini 0', { siteRootBaseUrl })

// ----------
let scriptElement = document.createElement('script')
scriptElement.setAttribute('type', 'importmap')
scriptElement.setAttribute('id', 'main-imports')
const imports = {
  boolean: 'https://renoirb.github.io/site-assets/static/esm-modules/stringificator-boolean.mjs',
  'value-boolean-element': 'https://renoirb.github.io/site-assets/static/esm-modules/value-boolean.mjs',
}
scriptElement.innerText = JSON.stringify({imports})
document.body.appendChild(scriptElement)
scriptElement = document.createElement('script')
scriptElement.setAttribute('type', 'application/json')
scriptElement.setAttribute('id', 'appConfig')
scriptElement.innerText = JSON.stringify({
  siteRootBaseUrl: encodeURIComponent(siteRootBaseUrl),
})
document.body.appendChild(scriptElement)
// scriptElement = document.createElement('script')
// scriptElement.setAttribute('type', 'module')
// scriptElement.setAttribute('id', 'main')
// scriptElement.setAttribute('charset', 'utf-8')
// scriptElement.setAttribute('blocking', 'render')
// scriptElement.setAttribute('async', '')
// scriptElement.setAttribute('src', `${siteRootBaseUrl}js/blogtini.js?siteRootBaseUrl=${encodeURIComponent(siteRootBaseUrl)}`)
// document.body.appendChild(scriptElement)
// -----------

import './js/blogtini.js'
