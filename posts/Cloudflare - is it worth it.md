---
title: Cloudflare - is it worth it?
subtitle: I don't have time for your slow website proxying!
permalink: "{{ title | slug }}/"
heroimage: https://s3-ap-southeast-2.amazonaws.com/michaelgreenhill-net/cdn/2020/02/cloudflare1250-1.png
tags:
  - post
  - cloudflare
  - nginx
  - it
date: 2020-02-19
---

# {{ title }}

{{ subtitle }}

![{{ subtitle }}]({{ heroimage }})

So this website is still in its infancy. Less than a week old, in fact.

During my setup process (which I'll detail in a forthcoming article...) I made the decision wrap my site in the warm embrace of Cloudflare - a magical service full of the hopes, dreams, and promises of a secured and snappier website.

I dunno about security, but the snappier side of things left a lot to be desired...

## Slower than a wet week

So goes one of my dad's favourite catch phrases.

We're talking about a 600ms page load penalty. Considering that the native (i.e., nginx > Ghost) application renders pages in the browser within 70ms, and nginx caching brings that down to 50ms (barely more than the network RTT!), it's just abysmal.

For the visually-inclined:

![Direct to nginx](https://s3-ap-southeast-2.amazonaws.com/michaelgreenhill-net/cdn/2020/02/michaelgreenhill.net-direct-nocaching-1.png)

...versus....

![Suffering in agony with Cloudflare](https://s3-ap-southeast-2.amazonaws.com/michaelgreenhill-net/cdn/2020/02/michaelgreenhill.net-cloudflare-1.png)

![SLOOWWW](https://media3.giphy.com/media/QIQTfximd3AuQ/giphy.webp)

## Consciously uncoupling from Cloudflare

The most important step, of course, is to disable the proxy status of your Cloudflare DNS records. There's all sorts of privacy considerations with this, but if you're a smart cookie and are hosting your services externally (i.e., on AWS like this handsome website), then chances are you also don't subscribe to the security-through-obscurity model that Cloudflare offers.

![Click the orange cloud to Make Websites Great Again](https://s3-ap-southeast-2.amazonaws.com/michaelgreenhill-net/cdn/2020/02/image-8.png)

Next, you'll need to ensure your servers are appropriately hardened against security threats. **Since this is something you should be doing regardless**, I won't go it any further.

You have hardened your servers, right?

![Totally...](https://media3.giphy.com/media/VfzJD0dNOXdOX9UsV6/giphy.webp)

## But, Cloudflare caches my website!

And this is a good thing! If your site is anything other than static HTML there's great value in caching it and minimising a lot of the CPU time - especially if you're on AWS and want to use those juicy CPU credits.

**But nginx can do this for you!** (and yeah, so can Apache, if you like living in the 90's)

This is a concept called **microcaching**. There's a volume of information out there on the benefits microcaching, so instead of delving too deeply I suggest you start with the official nginx blog: https://www.nginx.com/blog/benefits-of-microcaching-nginx/

Using the live example from this site:

```
proxy_cache_path /opt/cache/ghost_secure levels=1:2 keys_zone=ghost_secure:10m max_size=1g inactive=60m use_temp_path=off;
proxy_cache_key "$scheme$request_method$host$request_uri";
proxy_cache_methods GET HEAD;

# ...

location {
    proxy_cache_revalidate        on;
    proxy_cache_use_stale         updating;
    proxy_cache_background_update on;
    proxy_cache_lock              on;
    proxy_cache                   ghost_secure;
    proxy_cache_valid             any 10m;
    proxy_ignore_headers          Cache-Control;
    proxy_cache_use_stale         error timeout http_500 http_502 http_503 http_504;
    proxy_cache_bypass            $http_upgrade;

    # ... all you other config directives go here...

    # example proxy_pass configuraton for your backend config
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header Host $http_host;
    proxy_pass http://127.0.0.1:2369;
}
```

Of course, if you're using fastcgi for a PHP application (for example), you can use the fastcgi caching instead.

As far as a small blog like this goes there's little benefit in microcaching: with it disabled, Ghost still renders pages in tidy fashion. But if I was to get the Reddit hug of death, microcaching would save not only my site, but also my wallet.