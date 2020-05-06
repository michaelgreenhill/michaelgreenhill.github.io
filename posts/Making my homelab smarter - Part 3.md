---
title: Making my homelab smarter - Part 3
subtitle: Compu-Global-Hyper-Mega-Net
permalink: "{{ title | slug }}/"
heroimage: /images/1_F5iT46roUJaBhAOV3fJNjA.png
heroimage_alt: A screenshot showing DHCPv6 addressing
layout: post
tags:
  - post
  - homelab
  - it
  - ipv6
date: 2020-01-08
author: 
  name: Michael Greenhill
  photo: "https://s3-ap-southeast-2.amazonaws.com/michaelgreenhill-net/cdn/2020/02/download.png"
---

Let's recap. Back in [Part 1](/making-my-homelab-smarter-part-1), I had a proper grumble about ADSL and routers. In [Part 2](/making-my-homelab-smarter-part-2) we enjoyed a good chat about multi-WAN (load balancing, failover) and policy-based routing.

## The big, scary, IPv6 monster

For those who don't know, we're out of IPv4 addresses. Globally. They're all gone. They even looked behind the fridge for more. So, it's time to embrace IPv6 (so far as your ISP will allow it!).

My ISP, Internode, gives me a delegated /56 block of addresses. "What does /56 mean?" I hear you all cry? Basically, instead of getting a single public IP address (as was typically the case with IPv4), I have **4,722,366,482,869,645,213,696** publicly-routable addresses to play with.

It's a visually offensive number. Unfathomably large. I don't even know which "illion" that comes out to. I tried to frame it as the number of seconds in a century, and it still came out to be a ridiculous number of centuries.

So while some of us are used to the IPv4 dotted-quad notation (192.168.1.1 with a subnet mask of 255.255.255.0), IPv6 goes a bit crazy and calls it the "canonical textual representation format" — one of those terms that just makes me feel warm and fuzzy inside — which looks something like 2001:db8:1234:0000:0000:0000:0000:0001. Thankfully, that can be shortened to 2001:db8:1234::1. For some quality bedtime reading, I suggest checking out the [Wikipedia article on IPv6](https://en.wikipedia.org/wiki/IPv6_address).

## Taming, understanding, and eventually, loving the monster

Thanks to some epic sleuthing (aka Google) I've got the following recipe to get IPv6 working both at the edge of and inside my network.

*Disclaimer: IPv6 is **globally routable!** The concept of NAT, and the security-through-obscurity that it provides, does not exist in IPv6. Any IPv6 addresses that you issue to your LAN computers can be reached from the internet — unless you have a good firewall. I take no responsibility if you get all virus'd up.*

The first thing we need to do is set our WAN interface's IPv6 configuration to **DHCP6**. This will get a /64 address from our ISP and provide a path out to the internet.

![So far, so good](/images/1_KIOqbpN_DiUfS5Xk98PrqA.png)

The trick here is to use the IPv4 interface (our PPPoE ADSL tunnel) to request our IPv6 connectivity.

![The 6 in IPv6 stands for "god damn enormous"](/images/1_Sw0YDnf5gPJSbIjM1VoGoA.png)

Save and apply the changes, then head over to the LAN interface. Here's where it gets interesting. Set the IPv6 configuration type to **Track Interface...**

!["Track Interface" is what used to happen when I passed out while running. Say that one out loud.](/images/1_86QT4D8YTA-7Y5Sk_Vbt_Q.png)

...then scroll down to the IPv6 Track Interface section, and set the **IPv6 Interface** to **WAN** and the **Prefix ID** to **0**.

![The Prefix ID may not be 0 — this may require some tweaking and contact with your ISP.](/images/1_PqucCadu7X-4ZAcNumGFhQ.png)

Save and apply, then head to the **Status > Interfaces** page. This will show you your WAN IPv6, your LAN IPv6, and any IPv6 Link Local addresses.

![Magic!](/images/1_hZgDYaeBrvezuxnw4ozFAg.png)

The next step, of course, is configuring pfSense to issue IPv6 addresses to machines on your network. Head on over to Services > DHCPv6 Server & RA.

While it looks daunting there's actually very little that needs configuring here:

* Enable DHCPv6 server on interface LAN
* Set the range from ::1000 to ::2000 (or whatever size you want)
* Set the DNS servers
* Save

![I'm using the ::1 address from my /56 subnet as the DNS server — i.e., the pfSense router.](/images/1_yMMvcM4ECmFpVGPRbYqjUA.png)

The final step is to configure the **Router Advertisements** section. You'll have noticed that the DHCPv6 configuration doesn't have an option to specify the default gateway — IPv6 does away with the concept of static gateways and, using the [Neighbor Discovery Protocol](https://en.wikipedia.org/wiki/Neighbor_Discovery_Protocol) (NDP), announces to the network what the router (aka default gateway) is.

![Probably should caption this, eh](/images/1_OXaSP4H123fBKGev11y0nQ.png)

Lastly, at the bottom of the page, check the checkbox next to **Use same settings as DHCPv6 server**, and click **Save**

![Hey, presto! DHCPv6.](/images/1_DcjQ3vTDFE-k7Q_PAatOPw.png)

![Spookyboi numbers](/images/1_F5iT46roUJaBhAOV3fJNjA.png)

---

## Once again, get your firewall sorted out

pfSense has a deny-by-default approach to firewall rules. Unless a rule exists to allow the traffic, it's blocked. This is good!

Unless you've a really good reason for allowing traffic into your network on the WAN interface, **don't**. Before you get IPv6 configured, take a few seconds to verify you don't have a cheeky "allow-all" rule on your WAN interface.

---

## Glossary

Someone pointed out that a glossary of terms would be useful. So, Guy, here ya go:

* [IPv6:](https://en.wikipedia.org/wiki/IPv6) the 6th version of the Internet Protocol.
* ISP: Internet Service Provider. Telstra, Verizon, BT, etc.
* [Subnet mask](https://en.wikipedia.org/wiki/Subnetwork): a method used to divide an IP address range.
* [NAT: Network Address Translation](https://en.wikipedia.org/wiki/Network_address_translation). Wot allows millions of 192.168.168.1 home routers to coexist on the internet without it literally erupting into flames.
* [/64, /56: Classless Inter-Domain Routing network sizes](https://en.wikipedia.org/wiki/Classless_Inter-Domain_Routing). A way of expressing the division of IP address ranges into smaller chunks.
* [DHCPv6](https://en.wikipedia.org/wiki/Dynamic_Host_Configuration_Protocol): The IPv6 version of the well-loved Dynamic Host Configuration Protocol. Dynamically issues an IP address to your computer from a larger pool of addresses.
* [Link Local](https://en.wikipedia.org/wiki/Link-local_address): A method used by IPv4 and IPv6 to self-issue IP addresses in the absence of DHCP or a statically-configured address.

