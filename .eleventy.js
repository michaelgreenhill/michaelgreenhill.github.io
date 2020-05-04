const eleventyNavigationPlugin = require("@11ty/eleventy-navigation");
const moment = require("moment");
const { DateTime } = require("luxon");
const fs = require("fs");
const cacheBuster = require('@mightyplow/eleventy-plugin-cache-buster');
const pluginRss = require("@11ty/eleventy-plugin-rss");
const readingTime = require('eleventy-plugin-reading-time');
const pluginSEO = require("eleventy-plugin-seo");
const pluginTOC = require('eleventy-plugin-toc');
const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");


module.exports = function (eleventyConfig) {

  eleventyConfig.addPlugin(eleventyNavigationPlugin);
  eleventyConfig.addPlugin(pluginRss);
  eleventyConfig.addPlugin(readingTime);
  eleventyConfig.addPlugin(pluginSEO, require("./_data/seo.json"));
  eleventyConfig.addPlugin(pluginTOC);
  eleventyConfig.addPlugin(syntaxHighlight);
  eleventyConfig.setUseGitIgnore(false);
  
  const cacheBusterOptions = {
    "outputDirectory": "./docs"
  };
  eleventyConfig.addPlugin(cacheBuster(cacheBusterOptions));

  eleventyConfig.addLayoutAlias('post', 'layouts/post.njk');
  eleventyConfig.addLayoutAlias('single', 'layouts/single.njk');
  eleventyConfig.addLayoutAlias('sidebar', 'layouts/post-with-sidebar.njk');
  eleventyConfig.addLayoutAlias('default', 'layouts/post.njk');

  eleventyConfig.addFilter("niceDate", function (date) {
    return moment(date).format("DD MMM YYYY");
  });

  eleventyConfig.addFilter("readableDate", dateObj => {
    return DateTime.fromJSDate(dateObj, {zone: 'utc'}).toFormat("dd LLL yyyy");
  });

  // https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#valid-date-string
  eleventyConfig.addFilter('htmlDateString', (dateObj) => {
    return DateTime.fromJSDate(dateObj, {zone: 'utc'}).toFormat('yyyy-LL-dd');
  });

  eleventyConfig.addCollection("tagList", require("./_11ty/getTagList"));

  eleventyConfig.addPassthroughCopy('favicon.ico');
  eleventyConfig.addPassthroughCopy('robots.txt');
  
  eleventyConfig.addPassthroughCopy('css', function () {
    return {
      passthroughFileCopy: true
    }
  });

  eleventyConfig.addPassthroughCopy('images', function () {
    return {
      passthroughFileCopy: true
    }
  });

  /* Markdown */
  let markdownIt = require('markdown-it')
  let markdownItAnchor = require('markdown-it-anchor')
  let options = {
    html: true,
    breaks: true,
    linkify: true,
    typographer: true
  }
  let opts = {
    permalink: true,
    permalinkClass: 'anchor-link',
    permalinkSymbol: '#',
    level: [1, 2, 3, 4]
  }

  eleventyConfig.setLibrary('md', markdownIt(options).use(markdownItAnchor, opts))

  return {
    dir: {
      input: "./",
      output: "./docs"
    }
  };
};