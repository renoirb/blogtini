/**
 * Dress up all the things
 */

console.log('RBx blogtini 0 ------------ \n')

import { boolean } from 'https://renoirb.github.io/site-assets/static/esm-modules/stringificator-boolean.mjs'

window.booleaner = boolean

const siteRootBaseUrl = await import.meta.resolve('./theme.js').replace('theme.js', '');

console.log('RBx blogtini 1 theme.js ------------ \n', { siteRootBaseUrl })
document.documentElement.setAttribute('data-site-root-base-url', siteRootBaseUrl)

// ----------
let scriptElement = document.createElement('script')
scriptElement.setAttribute('type', 'importmap')
scriptElement.setAttribute('id', 'main-imports')
scriptElement.setAttribute('class', 'blogtini-stuff')
const imports = {
  boolean: 'https://renoirb.github.io/site-assets/static/esm-modules/stringificator-boolean.mjs',
  'value-boolean-element': 'https://renoirb.github.io/site-assets/static/esm-modules/value-boolean.mjs',
}
scriptElement.innerText = JSON.stringify({imports})
document.head.appendChild(scriptElement)
scriptElement = document.createElement('script')
scriptElement.setAttribute('type', 'application/json')
scriptElement.setAttribute('id', 'appConfig')
scriptElement.setAttribute('class', 'blogtini-stuff')
const appConfig = {
  siteRootBaseUrl: encodeURIComponent(siteRootBaseUrl),
}
// document.documentElement.setAttribute('data-poo', siteRootBaseUrl)
scriptElement.innerText = JSON.stringify(appConfig)
window.appConfig = structuredClone(appConfig)
document.head.appendChild(scriptElement)
// scriptElement = document.createElement('script')
// scriptElement.setAttribute('type', 'module')
// scriptElement.setAttribute('id', 'main')
// scriptElement.setAttribute('charset', 'utf-8')
// scriptElement.setAttribute('blocking', 'render')
// scriptElement.setAttribute('async', '')
// scriptElement.setAttribute('src', `${siteRootBaseUrl}js/blogtini.js?siteRootBaseUrl=${encodeURIComponent(siteRootBaseUrl)}`)
// document.head.appendChild(scriptElement)
// -----------

console.log('RBx blogtini 0 ------------ \n')

import './js/blogtini.js'

console.log('RBx blogtini 0 ------------ \n')