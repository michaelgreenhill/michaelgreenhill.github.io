---
title: Dealing with silent failures
subtitle: Your code isn't as good as you think it is, and that's OK.
permalink: "{{ title | slug }}/"
heroimage: /images/failing2fail.png
heroimage_alt: Tom Haverford from Parks and Recreation commenting on Failing to Fail
layout: post
tags:
  - post
  - it
  - automation
  - observability
  - alerting
date: 2020-05-05
author: 
  name: Michael Greenhill
  photo: "https://s3-ap-southeast-2.amazonaws.com/michaelgreenhill-net/cdn/2020/02/download.png"
---

## Living on hopes and prayers

How many of you manually check a mission-critical script or task every day to ensure it's actually run? And, how many of you aren't checking it, instead blindly trusting that the Gods of Computing have allowed your peasant code to run without interference?

The concept of **silent failures** should not be new to anyone reading this blog. Shit happens; servers crash, internet connections drop out, HR changes the bloody organisational structure and breaks your automated onboarding... Shit. Happens.

When was the last time you checked that your VM backups were actually running...? *Ahh; the distant sound of panicked typing.*

## So how can I manage silent failures?

There's a multitude of different ways you can achieve this, but my preferred solution is via a simple web service called [Healthchecks.io](https://healthchecks.io/)

The premise is simple:

1. Create a check, which gives you a UUID
2. Set a schedule
3. Send a request to the API endpoint (referencing the UUID in the URL)
4. Profit

There are two key components of addressing silent failures, which Healthchecks.io handles well:

### Explicit failures

Through their API it's possible to send an **explicit failure** alert, indicating that your code has encountered an error and has goofed up. This would typically be handled in a `try/catch` block:

``` powershell
$script:HealthcheckUrl = "https://hc-ping.com/your-uuid-here"
try {
    # We haven't provided an identifier and we have supplied an invalid parameter; this will fail
    Set-AdUser -Path "blah"
    Invoke-RestMethod $script:HealthcheckUrl
} catch {
    Invoke-RestMethod "$($script:HealthcheckUrl)/fail"
}
```

### Implicit failures

Through the magic of scheduling we can also alert on an **implicit failure** - the code was *supposed* to run, but since we never received an explicit success ping we can assume it's broken and, therefore, have an *implicit failure* on our hand.

This is particularly useful in situations such as:

* Cron/scheduler failing to start
* Timezone confusion
* Script failing to complete and explicit failures have not been added

We can also flag an implicit failure by measuring **script runtime**: this is very useful when you have a tightly-coupled set of scripts or tasks that rely heavily on tasks completing within a pre-defined timeframe. For example; assume you have a MSSQL maintenance plan to back up your database; this runs at 2 AM and typically takes 45 minutes to complete. At 3 AM another task copies that backup to a different storage medium in a different location (remember your [3-2-1 backup rule](https://www.backblaze.com/blog/the-3-2-1-backup-strategy/), folks).

What happens if the MSSQL maintenance plan hasn't finished by 3 AM? This would be an implicit failure, as a downstream dependency (your copy task) will fail.

## What about the silent part?

For starters it interacts with all the standard alerting and messaging services (such as PagerDuty, OpsGenie, Slack, and Teams), but it also exposes a **webhook function**. With this it's possible to create any kind of customised alert.

For example; want to push a ticket to JIRA Service Desk when something mission-critical fails? 

![Test](/images/healthchecks-io-webook.png)

### Request Body

``` json
{
  "requestParticipants": [
    "JIRA-user-ID"
  ],
  "serviceDeskId": "5",
  "requestTypeId": "10",
  "requestFieldValues": {
    "summary": "$NAME is $STATUS",
    "description": "The automated health check $NAME is $STATUS as of $NOW\n\nhttps://healthchecks.io/projects/Your-Healthchecks-Project-ID/checks/\n\n$TAGS",
    "customfield_13052": [{
        "value": "The value of a custom JIRA field"
    }],
    "priority": {
        "name": "3 - Medium"
    }
  }
}
```

### Request Headers

```
Accept: application/json
Authorization: Basic Your-JIRA-API-Key
Content-Type: application/json
```

### Generating a JIRA API token

It's a long-winded process: follow the instructions over at https://developer.atlassian.com/cloud/jira/platform/basic-auth-for-rest-apis/ for enabling basic authentication for JIRA.

There you go; by enabling monitoring on your scripts or tasks you can tame the silent failures beast.

*Side note: enabling healthchecks is not an excuse to not check your backups. You should still be testing the validity and restorability of your backups; otherwise, they may as well be useless!*
