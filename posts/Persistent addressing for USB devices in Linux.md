---
title: Persistent addressing for USB devices in Linux
subtitle: Or, why doesn't Linux do this for me, if it's so damn good?
permalink: "{{ title | slug }}/"
heroimage: /images/udev1.png
heroimage_alt: The crew from Airplane! flying on instruments.
layout: post
tags:
  - post
  - linux
  - libusb
  - udevadm
  - homeassistant
date: 2022-04-22
author: 
  name: Michael Greenhill
  photo: "https://s3-ap-southeast-2.amazonaws.com/michaelgreenhill-net/cdn/2020/02/download.png"
---

So I've decided that I just have way too much free time and, therefore, should dive head-first into home automation. I'm also a tightarse.

Combining these two talents (?), I figure I can sprinkle a dash of Linux black magic to help me listen to any neighbouring weather stations, soak up their data, and get some location-specific weather observations.

Normal people would be fine with the Bureau of Meterology's forecasts and observations, but that's a) too easy, and b) there's a good 1-3 degree temperature difference between the bottom of my hill and the top where I live, so yeah.

Why am I blethering on about home automation when the headline refers to persistent addressing? Could it be clickbait? The answer will shock you!

## The hardware

So I know I said I'm a cheapskate, but for this contribution to mankind's collective knowledge I'm using a [Nooelec RTL-SDR gizmo from Amazon](https://www.amazon.com.au/gp/product/B01GDN1T4S/ref=ppx_yo_dt_b_asin_title_o00_s00?ie=UTF8&psc=1). This comes with three different aerials, so hooray for landfill.

## Commence the time "investment"

Fast forward a couple of days and I have the aforementioned USB thingo ready to go.

At this point it's plugged into my Linux environment (a QNAP NAS with Docker) - fire up the aul SSH terminal and let's get cracking.

### Identifying the device

First, I have to figure out which of the bazillion entries in `/dev` corresponds to my device:

``` bash
$ lsusb
Bus 003 Device 070: ID 1cf1:0030
Bus 003 Device 071: ID 0bda:2838 Realtek Semiconductor Corp.
Bus 003 Device 002: ID 1c05:2074
Bus 003 Device 001: ID 1d6b:0002 Linux Foundation 2.0 root hub
Bus 004 Device 002: ID 1c05:3074
Bus 004 Device 001: ID 1d6b:0003 Linux Foundation 3.0 root hub
Bus 001 Device 003: ID 1005:b155 Apacer Technology, Inc.
Bus 001 Device 002: ID 0438:7900 Advanced Micro Devices, Inc.
Bus 001 Device 001: ID 1d6b:0002 Linux Foundation 2.0 root hub
Bus 002 Device 002: ID 0438:7900 Advanced Micro Devices, Inc.
Bus 002 Device 001: ID 1d6b:0002 Linux Foundation 2.0 root hub
```

Based on the output of `lsusb` I can see my **Realtek Semiconductor Corp.** device - aka my RTL SDR 433 USB BIBBLYBOB - is on bus 3 as device 71.

From here I could simply pass this through to my container as `/dev/bus/usb/003/071`, but what happens if I reboot the NAS, or unplug and plug it back in? You guessed it, the ID changes. This isn't sustainable as my NAS reboots every week.

### Assigning a symlink to the device

I can tell `udev` that I want a specific symbolic link to be created when this device is identified. There's a few different ways to skin this cat, but let's go with the following.

Using `udevadm` we can scrape a few key identifiers for this specific device:

``` bash
$ udevadm info --name=/dev/bus/usb/003/071  --attribute-walk

Udevadm info starts with the device specified by the devpath and then
walks up the chain of parent devices. It prints for every device
found, all possible attributes in the udev rules key format.
A rule to match, can be composed by the attributes of the device
and the attributes from one single parent device.

  looking at device '/devices/pci0000:00/0000:00:10.0/usb3/3-1/3-1.4':
    KERNEL=="3-1.4"
    SUBSYSTEM=="usb"
    DRIVER=="usb"
    ATTR{configuration}=="USB2.0-Bulk&Iso"
    ATTR{bMaxPacketSize0}=="64"
    ATTR{bDeviceClass}=="00"
    ATTR{bcdDevice}=="0100"
    ATTR{bNumInterfaces}==" 2"
    ATTR{bConfigurationValue}=="1"
    ATTR{manufacturer}=="Realtek"
    ATTR{bNumConfigurations}=="1"
    ATTR{authorized}=="1"
    ATTR{speed}=="480"
    ATTR{idProduct}=="2838"
    ATTR{urbnum}=="12"
    ATTR{devnum}=="71"
    ATTR{product}=="RTL2838UHIDIR"
    ATTR{maxchild}=="0"
    ATTR{bmAttributes}=="80"
    ATTR{bDeviceSubClass}=="00"
    ATTR{bMaxPower}=="500mA"
    ATTR{rx_lanes}=="1"
    ATTR{removable}=="unknown"
    ATTR{idVendor}=="0bda"
    ATTR{version}==" 2.00"
    ATTR{avoid_reset_quirk}=="0"
    ATTR{serial}=="00000001"
    ATTR{bDeviceProtocol}=="00"
    ATTR{tx_lanes}=="1"
    ATTR{ltm_capable}=="no"
    ATTR{devpath}=="1.4"
    ATTR{busnum}=="3"
    ATTR{quirks}=="0x0"
```

We can grab the `product` and `serial` attributes (and even the `manufacturer` if you're feeling fancy) and use this to identify our device.

Next, we need to create a udev rule. Following the [Debian udev guide](https://wiki.debian.org/udev) - and correcting file/folder paths based on the inevitable variations between Linux flavours - add the following to `/lib/udev/rules.d/z21_persistent-local.rules`

```
ATTR{product}=="RTL2838UHIDIR",ATTR{serial}=="00000001",SYMLINK+="rtl433"
```

Verify that you haven't completely cooked it by runnning `udevadm control --reload-rules` and checking the output isn't catastrophically bad.

Asuming all is well, unplug your device and plug it back in. You should now see a symlink at `/dev/rtl433` that points to the new underlying `/dev` path:

``` bash
$ ls -alh /dev/rtl433
lrwxrwxrwx 1 admin administrators 15 2022-04-22 12:28 /dev/rtl433 -> bus/usb/003/071
```

I'm now ready to pull this into Home Assistant via MQTT. Hooray, I guess?