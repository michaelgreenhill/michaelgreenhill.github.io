---
title: Making my homelab smarter - Part 2
subtitle: Get routed!
permalink: "{{ title | slug }}/"
heroimage: /images/1_1SYWH-QudwNvXrH1VUAlhw.png
layout: post
tags:
  - post
  - homelab
  - it
date: 2020-01-07
author: 
  name: Michael Greenhill
  photo: "https://s3-ap-southeast-2.amazonaws.com/michaelgreenhill-net/cdn/2020/02/download.png"
---

Back in [Part 1](/making-my-homelab-smarter-part-1/) I waffled on about the sad state of my internet and what I intended to do about it.

## Why should I care about pfSense?

Well, in my case, it comes down to a few choice points:

* Multi-WAN that actually works as it’s supposed to
* Policy-based routing
* Security in a world of IoT nonsense
* IPv6
* Observability

It's also open-source and built on FreeBSD — both a bonus from cost and security perspectives.

## Give me that sweet WAN

*For the uninitiated, “WAN” refers to “Wide Area Network”. It’s a fancy way of saying “internet”.*

In terms of actual internet connections I have:

* Internode Naked ADSL2, maxing out at 4mbps down and 400kbps up
* Optus 4G with a 500gb data cap

So until NBN finally kicks down my door and shoves a 100mbps pipe of memes into my network, I have to make do with a balance of ADSL and 4G.

### So what does multi-WAN look like?

* Some things should only ever go via ADSL
* Some things should only ever go via 4G
* Some things should try to go via ADSL and failover to 4G, and
* Some things should try to go via 4G and failover to ADSL
* Some things should load balance across ADSL and 4G

For example; my ADSL connection can happily stream Netflix, Stan, Amazon Prime, YouTube etc. to my 55" TV with “good enough” quality. Therefore, that traffic should only ever go via ADSL, so I don’t blow out my data usage in one binge session of The Witcher (toss a coin, yeah?)

Conversely, low-latency traffic (RDP, SSH) should go via 4G, to stop me from throwing expensive IT equipment in frustration.

![Don’t you go peeping and my IPs, ya hear me](/images/1_1SYWH-QudwNvXrH1VUAlhw.png)

Don’t you go peeping and my IPs, ya hear me!

From here I’ve put the gateways into gateway groups — these control failover and load balancing.

![Annoyingly, IPv6 duplicates everything](/images/1_bJgTd-LKMdIrIIVdCkLPng.png)

Annoyingly, IPv6 duplicates everything.

We can visualise the failover and gateway preference via the Status > Gateways page:

![A bug in pfSense shows the IPv6 gateways as “Gathering data” here, but elsewhere they are “Online”](/images/1_jDsM0PU32ro6rXQDrUweDg.png)

## Those were pretty pictures, now what?

Well, next we need to tell pfSense what should go out via those gateways. As much as I’d like to shout “OK pfSense, send all Netflix through ADSL” it’s just not that clever. Yet.

The next best thing would be to create a firewall rule for anything going to netflix.com. Unfortunately, that won’t work. Because Netflix is so massive and [consumes 12.9% of all internet](https://variety.com/2019/digital/news/netflix-loses-title-top-downstream-bandwidth-application-1203330313/) traffic — think about that, for a minute — it has a huge content delivery network, with its Open Connect peering injecting cake videos straight to the ISP networks. It’s also mercurial — servers that are up one minute are downed the next, thanks to Chaos Monkey.

And since this needs to be a **reliable** and **dependable** routing solution, the best approach is to apply the rule to the client. In other words, **all traffic** from my TV and my Chromecast should go via the ADSL gateway. We accomplish this via a firewall alias:

![For testing purposes, I’m allowing these devices to fall back to 4G](/images/1_GUXrZ862oho5ams1IXC-QQ.png)

For testing purposes, I’m allowing these devices to fall back to 4G.

### Tying it all together with a bow

Finally, we create a firewall rule to route this traffic accordingly.

Specifying the source as our firewall alias and our destination as “http_ports” (another alias of ports 80 and 443)...

![All streaming services run over HTTPS, so we can limit the rule to just these ports](/images/1_9AvJ0Ndfdt9huSSxk8aDaA.png)

All streaming services run over HTTPS, so we can limit the rule to just these ports

Next, we specify the gateway group...

![This image has no caption. Surprise!](/images/1_KJ9g0FvxpORAhJSvSKAcOw.png)

...and hey, presto! We have a policy-based route that directs all traffic from my TV and from my Chromecast, over ports 80 and 443, out through the ADSL router.

Yeah, it’s not quite the most elegant solution, but it’s a **simple solution**.

---

But your default gateway is WAN_PPPOE?

Yeah, you saw that huh? Yes, the above example is theoretically useless because, unless otherwise instructed by a firewall rule, **all traffic** will go out via the ADSL link. But that’s just this point in time. By the time this series is finished, I hope to have my 4G link set up as my default route, either implicitly via discrete firewall rules as I’ve just demonstrated, or explicitly via the default gateway option.

