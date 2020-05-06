---
title: Making my homelab smarter - Part 1
subtitle: Or, how I NUC'd everything up.
permalink: "{{ title | slug }}/"
heroimage: /images/1_omi0RFCCZNWaUQGTgcnjCA.png
heroimage_alt: Network diagram of my home lab
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

It's always the way, isn't it? The builder's house is need of repairs, the chef's cupboard is always empty, and the IT professional's home lab is trash.

Ah ok, maybe just my lab then…

For the last five years I've been "enjoying" life on ADSL in Melbourne's outer east — and therefore, I've had no real need or desire to drop coin on a decent home lab. Why bother, when my best speed was 7mbps down/1mbps up? Well, with FTTC NBN arriving on my doorstep within the next six months and a reasonably-priced Optus 4G plan to supplement my glacial ADSL, I figured the time was ripe to upgrade.

That, and my ADSL router decided it was necessary to do a full reboot any time any config directives were changed.

---

## The sad state of affairs

Between 2015 and now, my home network consisted of:

* FritzBox 7270 xDSL router
* QNAP TVS-663 6-bay NAS
* Ubiquiti AP-AC-Pro
* Cisco SG-100D-08 gigabit unmanaged switch
* Ubiquiti Unifi Switch-8 PoE

The main limitation with this setup was the FritzBox xDSL router. While it had nice ADSL functionality and, to be fair, better reliability at high speeds compared to other routers, it was also quite limited in other respects. For example, it was impossible to change the DNS suffix from ".fritz.box"

Honestly, it was fine for the average user, but rubbish for any kind of serious customisation.

The QNAP NAS runs a number of containers, such as the Unifi Controller and the Unifi NVR for my IP cameras. But, it was also proving to be slow, clunky, and increasingly difficult to manage said containers.

---

## Improvements

Well, maybe not.

Once the NBN works commenced in my area the ADSL speed dropped down to 4mbps down/400kbps up. During the troubleshooting process I bought a new NBN-compatible router, an Asus DSL-AC86U.

Let me tell you the ways in which this router is an absolute joke:

* The price. It retails for $250
* Almost any change, at all, requires a full reboot. Oh, and it doesn't tell you it's about to reboot, it just does it.
* Yes, it has WAN failover. But only from DSL to USB/Ethernet, not to DSL.
* The multi-WAN load balancing doesn't work — it's either all or nothing, irrespective of what ratio is used
* Yes, it has an SSH terminal via AsusWRT. But, no cron engine (at least, none that works — cru doesn't persist jobs between reboots)

I could go on, but frankly, I'm already bored.

## Biting the bullet and dropping the coin

It was always my intention to invest in a pfSense-based router come NBN time, either in advance of or after connection. So, borne out of my frustrations with both the FritzBox and the Asus routers, I made myself a pfSense router via the router-on-a-stick design.

### The shopping list

* [Intel Mini PC NUC Kit NUC5PPYH](https://www.scorptec.com.au/product/Branded-Systems/NUC-&-Mini-PC/59984-BOXNUC5PPYH/?member_pricing=true)
$199.00
* [1x Kingston KVR16LS11/8 8GB 1600MHz DDR3L SODIMM](https://www.scorptec.com.au/product/Memory/SODIMM/52039-KVR16LS11-8/?member_pricing=true)
$69
* [1x Western Digital WD Green 3D NAND 120GB SSD](https://www.scorptec.com.au/product/Hard-Drives-&-SSDs/SSD-2.5-&-PCI-Express/70810-WDS120G2G0A/?member_pricing=true)
$32

In addition, I also had a Ubiquiti EdgeRouter X which I configured in Layer-2 switching mode, to provide the VLANs necessary for a single-NIC router.

### The topology

As you can see from the diagram below, the pfSense router is a router-on-a-stick; that is, it has one interface carrying traffic separated by VLANs.

![Magical packet mystery tour]({{ heroimage }})

The ADSL router is the POS Asus DSL-AC68U — not configured for bridge mode, because it doesn’t support it — but with everything disabled (DHCP, NAT, firewalled to the nth degree, etc) and with PPPoE forwarding enabled.

Frustratingly, I still need to maintain a PPPoE connection on the Asus router for PPPoE forwarding to be stable. Without a valid PPPoE connection, the pfSense router can create a PPPoE connection on its own, but it drops after a few seconds. Every. Time.

### But you had an EdgeRouter X, why didn’t you use it as a router?

Because I didn’t want to.

I know pfSense like the back of my hand and I knew I could spin up a secure multi-WAN router with load balancing, IDS/IPS, and policy-based routing (spoiler alert for part 2) within a day. Some of that functionality just doesn’t exist on the EdgeRouter X.

## But wait, tell me more!
Check out [Part 2](/making-my-homelab-smarter-part-2/) for more salacious details.
