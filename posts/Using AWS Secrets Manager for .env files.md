---
title: Using AWS Secrets Manager for .env files
subtitle: Extracting secrets from AWS Secrets Manager and dumping to .env files, for fun and profit!
permalink: "{{ title | slug }}/"
heroimage: https://s3-ap-southeast-2.amazonaws.com/michaelgreenhill-net/cdn/2020/02/the-outcome-economy-2-638.jpg
layout: post
tags:
  - post
  - aws
  - it
date: 2020-02-17
author: 
  name: Michael Greenhill
  photo: "https://s3-ap-southeast-2.amazonaws.com/michaelgreenhill-net/cdn/2020/02/download.png"
---

Managing environment files for highly-available cloud apps can be tricky. The easiest option, of course, is to embed these environment files into your code repo, but of course, that then commits secrets (passwords, API keys, etc) into the repo for all to see.

Yeah, not such a great idea, then.

One option is to use AWS Secrets Manager. This tool securely stores your secrets (for the princely sum of $0.40 per secret per month) - well, as securely as your IAM policies dictate.

## What exactly is a secret?

In terms of pricing, the AWS pricing model lists $0.40 per secret per month. A secret can contain multiple key=value pairs, up to a total size of 10kb per secret.

With that in mind, it's trivial to create a key=value stack in Secrets Manager.

![Example AWS Secret](https://s3-ap-southeast-2.amazonaws.com/michaelgreenhill-net/cdn/2020/02/image-7.png)

## Accessing the secrets from EC2

Assuming you've been following the AWS best practices and have assigned a role to your EC2 instances, it's just a matter of creating an IAM policy that grants access to the secret, and attaching it to your EC2 role.

```
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "secretsmanager:GetResourcePolicy",
                "secretsmanager:GetSecretValue",
                "secretsmanager:DescribeSecret",
                "secretsmanager:ListSecretVersionIds"
            ],
            "Resource": "<ARN of your fancy new secret>"
        }
    ]
}
```

This policy grants read-only access to your secret (because your EC2 instance should not be able to manipulate the secret!)

The final step is to extract the secret and dump it to a .env file in KEY="value" format.

```
#!/bin/bash

AWS_SECRET_ID="my-super-secret-secret"
AWS_REGION="ap-southeast-2"
ENVFILE="/srv/app/.env"

# Ensure your EC2 instance has the most recent version of the AWS CLI
apt-get install -y python3-pip jq
pip3 install awscli --upgrade

# Export the secret to .env
aws secretsmanager get-secret-value --secret-id $AWS_SECRET_ID --region $AWS_REGION | \
  jq -r '.SecretString' | \
  jq -r "to_entries|map(\"\(.key)=\\\"\(.value|tostring)\\\"\")|.[]" > $ENVFILE
```

And that's pretty much it!