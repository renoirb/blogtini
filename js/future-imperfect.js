/* eslint-disable */
/*
 * FROM: https://github.com/traceypooh/blogtini/blob/0e02414172bf1994a23b9c067b161e49c8dd9552/js/future-imperfect.js
 *
 * Docs:
 * - https://lunrjs.com/docs/index.html
 * - https://github.com/olivernn/lunr.js
 */
import $ from 'https://esm.archive.org/jquery'
import lunr from 'https://esm.archive.org/lunr'
import dayjs from 'https://esm.archive.org/dayjs'

import { summarize_markdown, markdown_to_html } from './text.js'


// Flyout Menu Functions
let toggles = {
  ".search-toggle": "#search-input",
  ".lang-toggle": "#lang-menu",
  ".share-toggle": "#share-menu",
  ".nav-toggle": "#site-nav-menu"
};

// Search
let idx;                // Lunr index
let resultDetails = {}; // Will hold the data for the search results (titles and summaries)
let $searchResults;     // The element on the page holding search results
let $searchInput;       // The search box element
let site_cfg;           // config from main blogtini.js

const getTextFromHtmlizedText = (innerHTML) => {
  const node = document.createElement('div');
  node.innerHTML = String(innerHTML);
  // Let's remove code from contents.
  node.querySelectorAll('script,pre,style,code').forEach((what) => {
    what.remove()
  })
  node.textContent = node.textContent.replace(/\s/g, ' ').trim()
  return node;
}

window.djs = dayjs
window.getTextFromHtmlizedText = getTextFromHtmlizedText

function search_setup(docs, cfg) {
  site_cfg = cfg;

  console.debug(`blogtini search_setup 0 `, { docs, cfg })

  for (const doc of docs) {
    resultDetails[doc.url] = doc
  }

  $.each(toggles, function(toggle, menu) {
    $(toggle).on("click", function() {
      if ($(menu).hasClass("active")) {
        $(".menu").removeClass("active");
        $("#wrapper").removeClass("overlay");
      } else {
        $("#wrapper").addClass("overlay");
        $(".menu").not($(menu + ".menu")).removeClass("active");
        $(menu).addClass("active");
        if (menu == "#search-input") {$("#search-results").toggleClass("active");}
      }
    });
  });

  // Click anywhere outside a flyout to close
  $(document).on("click", function(e) {
    if ($(e.target).is(".lang-toggle, .lang-toggle span, #lang-menu, .share-toggle, .share-toggle i, #share-menu, .search-toggle, .search-toggle i, #search-input, #search-results .mini-post, .nav-toggle, .nav-toggle i, #site-nav") === false) {
      $(".menu").removeClass("active");
      $("#wrapper").removeClass('overlay');
    }
  });

  // Check to see if the window is top if not then display button
  $(window).scroll(function() {
    if ($(this).scrollTop()) {
      $('#back-to-top').fadeIn();
    } else {
      $('#back-to-top').fadeOut();
    }
  });

  // Click event to scroll to top
  $('#back-to-top').click(function() {
    $('html, body').animate({scrollTop: 0}, 1000);
    return false;
  });


  // Get dom objects for the elements we'll be interacting with
  $searchResults = document.getElementById('search-results');
  $searchInput   = document.getElementById('search-input');

  let indexBuilder
  // Build the index so Lunr can search it.  The `ref` field will hold the URL
  // to the page/post.  title, excerpt, and body will be fields searched.
  idx = lunr(function adder(input) {
    indexBuilder = this
    indexBuilder.ref('url')
    indexBuilder.field('title')
    indexBuilder.field('date') // xxx typo in source!
    indexBuilder.field('body_raw')
    indexBuilder.field('body', { boost: 2 })
    indexBuilder.field('tags')
    indexBuilder.field('categories')

    console.debug(`blogtini search_setup 1 lunr `, { adder: input })

    // Loop through all documents and add them to index so they can be searched
    docs.forEach(function (doc, i) {
      const {
        body_raw = '',
        categories = [],
        date = '',
        tags = [],
        title = '',
        url = '',
      } = doc
      const htmlized = markdown_to_html(body_raw ?? '')
      const domNode = getTextFromHtmlizedText(htmlized)
      const body = String(domNode.textContent)
      console.debug(`blogtini search_setup 1 lunr forEach (index: ${i})`, { url, title, date, tags, categories, body_raw, body })
      console.debug(`blogtini search_setup 1 lunr forEach (index: ${i})`, body)
      indexBuilder.add({ url, title, date, tags, categories, body_raw, body })
    }, indexBuilder)
  });


  window.getLunr = () => {
    console.debug(`blogtini search_setup 2 lunr getLunr`, { lunrIndex: idx })
    return idx
  }

  // Register handler for the search input field
  registerSearchHandler();
};

function registerSearchHandler() {
  $searchInput.oninput = function(event) {
    var query = event.target.value;
    var results = search(query);  // Perform the search

    console.debug(`blogtini registerSearchHandler $searchInput.oninput`, { query, results })

    // Render search results
    renderSearchResults(results);

    // Remove search results if the user empties the search phrase input field
    if ($searchInput.value == '') {
      $searchResults.innerHTML = '';
    }
  }
}

function renderSearchResults(results) {
  console.debug(`blogtini renderSearchResults`, { matches: results.length })
  // Create a list of results
  var container = document.createElement('div');
  if (results.length > 0) {
    results.forEach(function (result) {
      const resultRef = result?.ref
      if (resultRef) {
        const resultData = resultDetails[resultRef]

        const title = Reflect.get(resultData, 'title') ?? ''
        const date = Reflect.get(resultData, 'date') ?? ''
        const href = resultRef
        // const bodyOne = Reflect.get(resultData, 'body_raw') ?? ''
        // const bodyTwo = Reflect.get(resultData, 'body') ?? ''

        console.debug(`blogtini renderSearchResults results.forEach`, { 'result.ref': result.ref, result, resultData })

        // Create result item
        // blogtini-search-result
        const searchResultElement = document.createElement('blogtini-search-result')
        searchResultElement.setDependency(dayjs)
        searchResultElement.setAttribute('date', date)
        searchResultElement.setAttribute('title', title)
        searchResultElement.setAttribute('href', href)
        const p = document.createElement('p')
        p.innerHTML = summarize_markdown(resultDetails[result.ref].body_raw, site_cfg.summary_length)
        searchResultElement.appendChild(p)
        container.appendChild(searchResultElement)
        /*
        container.innerHTML += `
          <article class="mini-post">
            <a href="${result.ref}">
              <header>
                <h2>${resultDetails[result.ref].title}</h2>
                <time class="published" datetime="">
                  ${dayjs(resultDetails[result.ref].date).format('MMM D, YYYY')}
                </time>
              </header>
              <main>
                <p>
                  ${summarize_markdown(resultDetails[result.ref].body_raw, site_cfg.summary_length)}
                </p>
              </main>
            </a>
          </article>`
          */
      }
    });

    // Remove any existing content so results aren't continually added as the user types
    while ($searchResults.hasChildNodes()) {
      $searchResults.removeChild(
        $searchResults.lastChild
      );
    }
  } else {
    $searchResults.innerHTML = '<article class="mini-post"><main><p>No Results Found...</p></main></a></article>';
  }

  // Render the list
  $searchResults.innerHTML = container.innerHTML;
}

function search(query) {
  const res = idx.search(query)
  console.debug(`blogtini search_setup 3 lunr search`, { query, res, lunrIndex: idx })
  return res;
}

export default search_setup

