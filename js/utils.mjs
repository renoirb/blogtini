/**
 * A BaseURL should start by a protocol, and end by a slash.
 * Otherwise appending things at the end of it might make unintended invalid paths.
 */
export const isBaseUrlWithEndingSlash = (url) => {
  return /^(https?|file)\:.*\/$/.test(url)
}

export const assertBaseUrlWithEndingSlash = (url) => {
  if (isBaseUrlWithEndingSlash(url) === false) {
    const message = `Invalid baseURL, it MUST begin by a protocol, and end by a slash, we got: "${url}"`
    throw new Error(message)
  }
}

/**
 * Check if the begining of the URL provided matches the production.
 */
export const isBaseUrlHostForProduction = (
  siteRootBaseUrl,
  compareWith = '',
) => {
  assertBaseUrlWithEndingSlash(siteRootBaseUrl)
  const regEx = new RegExp('^' + siteRootBaseUrl)
  const match = (compareWith ?? '').match(regEx)
  return match !== null
}

/**
 * During development, we might still want to read files from current development host
 * not production.
 */
export const adjustProductionBaseUrlForDevelopment = (
  input,
  productionSiteRootBaseUrl,
  siteRootBaseUrl = '',
) => {
  console.log('adjustProductionBaseUrlForDevelopment', {
    input,
    productionSiteRootBaseUrl,
    siteRootBaseUrl,
  })
  // Question:
  // Check if input starts the same as productionSiteRootBaseUrl,
  // so we're not scratching our heads why things aren't the same locally
  // and once deployed
  // assertBaseUrlWithEndingSlash(productionSiteRootBaseUrl)
  // assertBaseUrlWithEndingSlash(siteRootBaseUrl)
  const replaced = input.replace(
    new RegExp('^' + productionSiteRootBaseUrl),
    siteRootBaseUrl,
  )
  console.log('adjustProductionBaseUrlForDevelopment', {
    productionSiteRootBaseUrl,
    siteRootBaseUrl,
    replaced,
  })
  return replaced
}

export const createBlogtiniEvent = (eventName, detail = {}) => {
  const event = new CustomEvent('blogtini', {
    bubbles: true,
    detail: { eventName, ...detail },
  })
  console.warn('createBlogtiniEvent', { eventName, ...detail })
  return event
}

export const createBlogtiniStuffWrapper = (host, id) => {
  const wrapper = host.createElement('div')
  wrapper.setAttribute('id', id)
  wrapper.setAttribute('class', 'blogtini-stuff')
  return wrapper
}

/**
 * Basically just take anything inside the body and put it all
 * inside an #original-content
 */
export const cleanUpInitialPayloadMarkup = (host) => {
  const wrapper = createBlogtiniStuffWrapper(host, 'blogtini-original-content')
  wrapper.setAttribute('style', 'display:none;')
  wrapper.append(...host.body.childNodes)
  host.body.appendChild(wrapper)
  wrapper.querySelectorAll('.blogtini-stuff').forEach((e) => {
    host.body.appendChild(e)
  })
  host.body.firstChild.dispatchEvent(
    createBlogtiniEvent('original-content-moved'),
  )
}
