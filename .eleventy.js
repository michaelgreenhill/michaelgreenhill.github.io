const eleventyNavigationPlugin = require("@11ty/eleventy-navigation");
const moment = require("moment");

module.exports = function (eleventyConfig) {
  /*
  var md = require('markdown-it')();
  var markdownItAttrs = require('markdown-it-attrs');
  var implicitFigures = require('markdown-it-implicit-figures');

  md.use(markdownItAttrs, {
    // optional, these are default options
    leftDelimiter: '{',
    rightDelimiter: '}',
    allowedAttributes: [] // empty array = all attributes are allowed
  });

  md.use(implicitFigures, {
    dataType: false, // <figure data-type="image">, default: false
    figcaption: false, // <figcaption>alternative text</figcaption>, default: false
    tabindex: false, // <figure tabindex="1+n">..., default: false
    link: false // <a href="img.png"><img src="img.png"></a>, default: false
  });

  eleventyConfig.setLibrary('md', md);
  */

  eleventyConfig.addPlugin(eleventyNavigationPlugin);

  eleventyConfig.addLayoutAlias('post', 'layouts/post.njk');
  eleventyConfig.addLayoutAlias('default', 'layouts/post.njk');

  eleventyConfig.addFilter("niceDate", function (date) {
    return moment(date).format("DD MMM YYYY");
  });

  return {
    dir: {
      input: "./", // Equivalent to Jekyll's source property
      output: "./docs" // Equivalent to Jekyll's destination property
    }
  };
};