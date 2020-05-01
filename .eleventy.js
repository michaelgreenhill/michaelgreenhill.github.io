const eleventyNavigationPlugin = require("@11ty/eleventy-navigation");
const moment = require("moment");
const { DateTime } = require("luxon");
const cacheBuster = require('@mightyplow/eleventy-plugin-cache-buster');
const pluginRss = require("@11ty/eleventy-plugin-rss");

module.exports = function (eleventyConfig) {

  eleventyConfig.addPlugin(eleventyNavigationPlugin);
  eleventyConfig.addPlugin(pluginRss);
  
  //const cacheBusterOptions = {};
  //eleventyConfig.addPlugin(cacheBuster(cacheBusterOptions));

  eleventyConfig.addLayoutAlias('post', 'layouts/post.njk');
  eleventyConfig.addLayoutAlias('tags', 'layouts/tags.njk');
  eleventyConfig.addLayoutAlias('default', 'layouts/post.njk');

  eleventyConfig.addFilter("niceDate", function (date) {
    return moment(date).format("DD MMM YYYY");
  });

  eleventyConfig.addFilter("readableDate", function (date) {
    return moment(date).format("DD MMM YYYY");
  });

  eleventyConfig.addFilter('htmlDateString', dateObj => {
    return DateTime.fromJSDate(dateObj).toFormat('MMMM d, yyyy')
  })

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

  return {
    dir: {
      input: "./",
      output: "./docs"
    }
  };
};