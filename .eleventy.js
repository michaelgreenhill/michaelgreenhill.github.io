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
const pluginLocalRespimg = require('eleventy-plugin-local-respimg');
const pluginPWA = require("eleventy-plugin-pwa");


module.exports = function (eleventyConfig) {

  eleventyConfig.addPlugin(eleventyNavigationPlugin);
  eleventyConfig.addPlugin(pluginRss);
  eleventyConfig.addPlugin(readingTime);
  eleventyConfig.addPlugin(pluginSEO, require("./_data/seo.json"));
  eleventyConfig.addPlugin(pluginTOC);
  eleventyConfig.addPlugin(syntaxHighlight);
  eleventyConfig.addPlugin(pluginPWA);
  
  const cacheBusterOptions = {
    "outputDirectory": "./docs"
  };

  // disabled due to incompatibilities with service workers
  //eleventyConfig.addPlugin(cacheBuster(cacheBusterOptions));

  eleventyConfig.addPlugin(pluginLocalRespimg, {
    folders: {
      source: '.', // Folder images are stored in
      output: 'docs', // Folder images should be output to
    },
    images: {
      resize: {
        min: 320, // Minimum width to resize an image to
        max: 2560, // Maximum width to resize an image to
        step: 320, // Width difference between each resized image
      },
      gifToVideo: false, // Convert GIFs to MP4 videos
      sizes: '(max-width: 600px) 500px, (max-width: 820px) 800px, 1040px', // Default image `sizes` attribute
      lazy: true, // Include `loading="lazy"` attribute for images
      additional: [
        // Globs of additional images to optimize (won't be resied)
        'images/icons/**/*',
      ],
      watch: {
        src: 'images/*', // Glob of images that Eleventy should watch for changes to
      },
      pngquant: {
        speed: 4,
        strip: true
      }, // imagemin-pngquant options
      mozjpeg: {
        quality: 90,
        progressive: true
      }, // imagemin-mozjpeg options
      svgo: {
        /* ... */
      }, // imagemin-svgo options
      gifresize: {
        /* ... */
      }, // @gumlet/gif-resize options
      webp: {
        /* ... */
      }, // imagemin-webp options
      gifwebp: {
        /* ... */
      }, // imagemin-gif2webp options
    },
  });

  eleventyConfig.setUseGitIgnore(false);

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
  eleventyConfig.addPassthroughCopy('manifest.json');
  
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

  eleventyConfig.addPassthroughCopy('favico', function () {
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

  const md = markdownIt(options)
  eleventyConfig.setLibrary('md', md.use(markdownItAnchor, opts))
  eleventyConfig.addFilter('markdownify', (markdownString) =>
    md.render(markdownString));

  return {
    dir: {
      input: "./",
      output: "./docs"
    }
  };
};