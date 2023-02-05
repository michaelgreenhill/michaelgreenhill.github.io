---
title: Homelab revisited
subtitle: When nature and nerd collide.
permalink: "{{ title | slug }}/"
heroimage: /images/PXL_20211107_055804404.jpg
heroimage_alt: A comms rack
layout: post
tags:
  - post
  - homelab
  - it
date: 2023-02-05
author: 
  name: Michael Greenhill
  photo: "https://s3-ap-southeast-2.amazonaws.com/michaelgreenhill-net/cdn/2020/02/download.png"
---

Way back in early 2020 I started documenting my misadventures in homelabbing, also known as *quick and easy ways to annoy your spouse*. Over the course of 2020 the lab evolved little thanks the one-two suckerpunch of COVID and lethargy, but opportunity came knocking one morning in September when a giant gum tree destroyed half the house, forcing an impromptu rennovation.

Fast-forward three years and the quaint little buggy homelab has grown considerably. It's still buggy, though.

## Recap

Back in 2020 my homelab consisted of a QNAP NAS, an Intel NUC-based router-on-a-stick running pfSense, a small cadre of containers, and ideas above its station:

![Ye olde architecture](/images/1_omi0RFCCZNWaUQGTgcnjCA.png)

The containers ran on QNAP's Docker/LXC impelementation and the NUC router performed...adequately. This was also pre-NBN days, so internet speed and quality was pretty crap thanks to ageing ADSL infrastructure.

## The new kid on the block

![Updated diagram](/images/Selby_networking_diagram-Page-2.jpg)

It's quite a bit different now, so let's break down the architectural changes.

### Core networking

I had struggled with the performance and reliability of the Intel NUC-based router-on-a-stick approach for quite some time, but was loathe to drop the money on a decent replacement (have I mentioned I'm a scrooge?). The Netgate SG-3100 has run pretty much flawlessly since it was bought, with the only faults due to Layer 8 issues.

The other big upgrade is the 48-port PoE Cisco switch, which has massively reduced complexity and increased stability.

### Philips Hue

I hate the price point and I hate the (relatively) small ecosystem, but *it just works*. All lights in the house are Philips Hue lights, either bulbs or downlights, with the exception of some outdoor flood lights controlled by - wait for it - a Philips Hue plug.

I made the conscious decision to go with Hue over other brands or a DIY solution, because I needed to make sure it was reliable and wife-proof. I could have saved a fair whack of money by going with other brands, but it's now been over a year since we moved back in and I've not regretted the decision.

### Docker

Where previous efforts at running containerised workloads had been localised to the QNAP NAS, this NAS is now part of a Docker swarm where workloads are spread across the nodes.

Some workloads aren't swarmed, such as Home Assistant and the RTL433 radio receiver, due to the specific hardware required for those two packages.

### Zigbee

Have I mentioned before that I'm lazy?

I'll jump at any opportunity to automate things. Via a ton of automations in Home Assistant and a number of door/window/motion sensors around the house, Things Happen(TM) automatically. E.g., turning on lights or heating when arriving at night.

### Weather stations

I wanted to use weather station data to help automate key systems around the house. E.g., lights will turn on automatically once the outside lumens detected on my anemomenter fall below a set threshold.

This is made possible via EcoWitt environmental sensors, an RTL433-compatible radio, a docker container, Mosquitto (MQTT), and a ton of automations in Home Assistant. This is also uploaded to [Wunderground.com](https://www.wunderground.com/dashboard/pws/IMELBO3723).

## What worked well?

To be honest, very little stood the test of time.

* Loading all the containers on the NAS was too much for the poor little SoC CPU, and general performance started to degrade rapidly when extra load was added (e.g., streaming from Plex),
* The NUC router died on multiple occasions, needing to be rebuilt at least twice,
* IPv6 was abandoned - I can't really blame this one on the implementation, I simply had to move house and disable it during the repairs and haven't spent the time to bring it all back online yet,
* The ADSL+4G load balancing was alright and fulfilled its purpose, but the failover aspect was rubbish. I think this is more of a pfSense implementation issue - likely, an issue on my end. With the fibre-to-the-curb I now have via NBN, the load balancing is irrelevant and it's stable enough to not bother with a full-time failover.
* The NUC previously used for router-on-a-stick was repurposed for Docker, but this ended up completely dying after about 8 months of use. It was replaced with an AMD Ryzen equivelent from ASUS.

Once the SG-3100 came online at my temporary accommodation I was able to bring the EdgeRouter X back to my house, and via a VPN tunnel maintain security camera recording functionality during the repairs. It now sits in a drawer somewhere, along with the 8-port Unifi switches.

## So what's the point of this article?

I guess there isn't. Well done you for making it this far through my stream-of-consciousness rmablings.

I had a Sunday to spare and wanted to reflect at a high level on how my home network has evolved over the last three years. Maybe you found it interesting, maybe nobody reads this. I guess I just wrote this so I had something to reflect on in another three year's time.

## What's next?

I plan to write up a series of articles on Home Assistant and the various automations I'm using, so my age-riddled brain will have something to fall back on in the future when I try to unpick my network.

I'm getting some smart roller blinds, so I'm looking forward to automating the shit out of those. I don't want to spoil the ending, but there's a fair bit of up and down involved in that story.