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

import { summarize_markdown, markdown_to_html } from './text.js'
import { debounce, getTextFromHtmlizedText } from './utils.mjs'

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


function search_setup(docs, cfg) {
  site_cfg = cfg;

  // console.debug(`blogtini search_setup 0 `, { docs, cfg })

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

    // console.debug(`blogtini search_setup 1 lunr `, { adder: input })

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
      // console.debug(`blogtini search_setup 1 lunr forEach (index: ${i})`, { url, title, date, tags, categories, body_raw, body })
      // console.debug(`blogtini search_setup 1 lunr forEach (index: ${i})`, body)
      indexBuilder.add({ url, title, date, tags, categories, body_raw, body })
    }, indexBuilder)
  });


  window.getLunr = () => {
    // console.debug(`blogtini search_setup 2 lunr getLunr`, { lunrIndex: idx })
    return idx
  }

  // Register handler for the search input field
  registerSearchHandler();
};

function registerSearchHandler() {
  const searchInputCallback = (evt) => {
    var query = evt.target.value;
    // Perform the search
    var results = idx.search(query);
    console.debug(`blogtini registerSearchHandler input`, { query, results: (results??[]).length })
    // Render search results
    renderSearchResults(results);
    // Remove search results if the user empties the search phrase input field
    if ($searchInput.value == '') {
      $searchResults.innerHTML = '';
    }
  }
  $searchInput.oninput = debounce(searchInputCallback, 400);
}

function renderSearchResults(results) {
  if (results.length > 0) {
    $searchResults.innerHTML = ''
    const counter = document.createElement('p')
    counter.textContent = `${results.length} results`
    $searchResults.appendChild(counter)
    for (const result of results) {
      const resultRef = result?.ref
      if (resultRef) {
        const resultData = resultDetails[resultRef]
        const title = Reflect.get(resultData, 'title') ?? ''
        const date = Reflect.get(resultData, 'date') ?? ''
        const href = resultRef
        const body = resultDetails[result.ref].body_raw
        // To reduce re-rendering and parsing
        // create a disconnected element, then appendChild
        // DocumentFragment does not support innerHTML, template does TIL
        const template = document.createElement('template')
        // Of course, this contrived way of showing search results won't scale
        // if we have many more. YOLO
        template.innerHTML = `
          <blogtini-search-result
            style="border:1px solid red;"
            date="${date}"
            title="${title}"
            href="${href}"
          >
            ${summarize_markdown(body, site_cfg.summary_length)}
          </blogtini-search-result>
        `
        const templateClone = template.content.cloneNode(true);
        $searchResults.appendChild(templateClone)
      }
    }
  } else {
    $searchResults.innerHTML = '<article class="mini-post"><main><p>No Results Found...</p></main></a></article>';
  }
}

export default search_setup
