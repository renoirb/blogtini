import { ContextRequestEvent } from './context.mjs'
import { isNotNullOrStringEmptyOrNull } from './utils.mjs'

/**
 * Context API to request date transformation
 */
export const ContextRequest_DateConversion = 'date-conversion'

export class SearchResultElement extends HTMLElement {
  static get observedAttributes() {
    return ['date', 'title', 'href']
  }

  set date(input = '') {
    if (isNotNullOrStringEmptyOrNull(input)) {
      const currentValue = this.getAttribute('date')
      const changed = currentValue !== input
      changed && this.setAttribute('date', input)
    }
  }

  set href(input) {
    if (isNotNullOrStringEmptyOrNull(input)) {
      const currentValue = this.getAttribute('href')
      const changed = currentValue !== input
      changed && this.setAttribute('href', input)
    }
  }

  set title(input) {
    if (isNotNullOrStringEmptyOrNull(input)) {
      const currentValue = this.getAttribute('title')
      const changed = currentValue !== input
      changed && this.setAttribute('title', input)
    }
  }

  constructor() {
    super()
    const shadowRoot = this.attachShadow({ mode: 'open' })
    const article = document.createElement('article')
    article.setAttribute('class', 'mini-post')
    article.innerHTML = `
      <style>
        :host, a {
          display: block;
        }
        header time:not([datetime]) {
          display: none;
        }
        a {
          text-decoration: none;
        }
      </style>
      <a href="">
        <header>
          <h2 class="title"></h2>
          <time></time>
        </header>
        <main part="main">
          <slot><!-- nothing --></slot>
        </main>
      </a>`
    shadowRoot.appendChild(article)
  }

  connectedCallback() {
    // Because the host has the attributes, and each
    // of them has a setter to put at the right place
    // where to use the value in the shadowDOM
    this.href = this.getAttribute('href')
    this.title = this.getAttribute('title')
    const date = this.getAttribute('date')
    this.date = date
    if (date) {
      this.dispatchEvent(
        new ContextRequestEvent(
          ContextRequest_DateConversion,
          this._onDateConversionContextEvent,
        ),
      )
    }
  }

  _onDateConversionContextEvent = (data) => {
    const { dateIsoString, dateUnix, dateHuman } = data
    const timeEl = this.shadowRoot.querySelector('time')
    if (dateIsoString) {
      timeEl.setAttribute('datetime', dateIsoString)
    }
    if (dateUnix) {
      timeEl.setAttribute('data-unix-epoch', dateUnix)
    }
    if (dateHuman) {
      timeEl.setAttribute('class', 'published')
      timeEl.textContent = dateHuman
    }
  }

  attributeChangedCallback(name, oldValue, newValue) {
    const changedWithValue =
      oldValue !== newValue && isNotNullOrStringEmptyOrNull(newValue)
    if (changedWithValue) {
      if (name === 'date') {
        this.dispatchEvent(
          new ContextRequestEvent(
            ContextRequest_DateConversion,
            this._onDateConversionContextEvent,
          ),
        )
      }
      if (name === 'href') {
        this.shadowRoot.querySelector('a[href]').setAttribute('href', newValue)
      }
      if (name === 'title') {
        this.shadowRoot.querySelector('a > header > h2').textContent = newValue
      }
    }
  }
}

const elements = [['blogtini-search-result', SearchResultElement]]

export const registerCustomElements = ({ customElements }) => {
  for (const [localName, classObj] of elements) {
    if (!customElements.get(localName)) {
      customElements.define(localName, classObj)
    } else {
      console.error(
        `ERR\t customElements.define <${localName} />, already defined.`,
      )
    }
  }
}
