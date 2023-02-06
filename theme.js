
const importMeta = import.meta
const currentScript = document.currentScript

import { boolean } from 'https://renoirb.github.io/site-assets/static/esm-modules/stringificator-boolean.mjs'
import 'https://renoirb.github.io/site-assets/static/esm-modules/value-boolean.mjs'

window.booleaner = boolean

console.log('RBx theme.js', { boolean, importMeta, currentScript, window, location: window.location })


import './js/blogtini.js'
