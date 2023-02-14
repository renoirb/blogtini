export class SearchResultElement extends HTMLElement {
  static get observedAttributes() {
    return ['date', 'title', 'href']
  }

  _dayJs = void 0

  get date() {
    return this.getAttribute('date')
  }

  get title() {
    return this.getAttribute('title')
  }

  get href() {
    return this.getAttribute('href')
  }

  constructor() {
    super()
    const shadow = this.attachShadow({ mode: 'open' })
    const elBody = document.createElement('div')
    elBody.innerHTML = '<!-- nothing -->'
    shadow.appendChild(elBody)
  }

  updateMarkup = ({ date, title, href }) => {
    const frag = document.createElement('article')
    frag.setAttribute('class', 'mini-post')
    frag.innerHTML = `
      <a href="${href}">
        <header>
          <h2>${title}</h2>
          <time class="published">${date}</time>
        </header>
        <main>
          <slot>
            <p>...</p>
          </slot>
        </main>
      </a>`
    frag.setAttribute('data-for', 'search-result')
    this.shadowRoot.appendChild(frag)
    if (this._dayJs) {
      const data = this._dayJs(date)
      const dateUnix = data.unix()
      const dateIsoString = data.toISOString()
      const dateHuman = data.format('MMM D, YYYY') // TODO: Make format configurable
      const timeEl = this.shadowRoot.querySelector('time')
      timeEl.setAttribute('datetime', dateIsoString)
      timeEl.setAttribute('data-unix-epoch', dateUnix)
      timeEl.textContent = dateHuman
      this.shadowRoot.querySelector('time').replaceWith(timeEl)
      console.debug(`<${this.localName} /> this._dayJs(date)`, {
        date,
        dateUnix,
        dateIsoString,
        dateHuman,
        timeEl,
      })
    }
    return frag
  }

  attributeChangedCallback(name, oldValue, newValue) {
    let href = this.getAttribute('href')
    let title = this.getAttribute('title')
    let date = this.getAttribute('date')
    let changed = false
    const reassign = (prevVal, newVal) => {
      if (prevVal === newVal) {
        return prevVal
      } else {
        changed = true
      }
      return newVal
    }
    switch (name) {
      case 'href':
        href = reassign(oldValue, newValue)
        break
      case 'title':
        title = reassign(oldValue, newValue)
        break
      case 'date':
        date = reassign(oldValue, newValue)
        break
    }
    console.debug(`<${this.localName} /> attributeChangedCallback`, {
      name,
      changed,
      oldValue,
      newValue,
      'this._dayJs': this._dayJs,
      href,
      title,
      date,
    })
    if (changed) {
      this.updateMarkup({ date, title, href })
    }
  }

  setDependency = (dependency) => {
    // console.debug(`<${this.localName} /> setDependency`, dependency)
    if (!Reflect.has(dependency, 'unix')) {
      const message = `This does not look like dayjs, there isn't a method named unix, dates will not be formatted`
      console.error(message)
    } else {
      this._dayJs = dependency.bind(this)
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
