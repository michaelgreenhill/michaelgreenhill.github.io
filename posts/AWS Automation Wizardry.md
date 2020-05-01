---
title: AWS Automation Wizardry
subtitle: SSM, EC2, IAM, CloudWatch, and other buzzwords.
permalink: "{{ title | slug }}/"
heroimage: /images/futurama_01_0105_going_robot_640x360.jpg
tags:
  - post
  - aws
  - automation
  - it
date: 2020-04-05
---

![{{ subtitle }}]({{ heroimage }})

In one of my [previous posts](/using-aws-secrets-manager-for-.env-files/) I demonstrated the use of AWS Secrets Manager for securely keeping and maintaining the state of a Laravel application .env file. 

Storing it is one thing - but how do you inform the Laravel application of the updated .env file when the secret changes? SSH-ing into each ephemeral EC2 instance is a nightmare: there *has* to be a better way.

## Enter the automator

Making use of **CloudWatch Events** we can trigger a **Systems Manager** command whenever the secret is updated. 

The first thing we need to do is define the **event pattern** in CloudWatch Events. 

```
{
  "detail": {
    "eventName": [
      "PutSecretValue"
    ],
    "eventSource": [
      "secretsmanager.amazonaws.com"
    ],
    "requestParameters": {
      "secretId": [
        "arn:aws:secretsmanager:<your region>:<your account id>:secret:<your secret ID>"
      ]
    }
  },
  "detail-type": [
    "AWS API Call via CloudTrail"
  ],
  "source": [
    "aws.secretsmanager"
  ]
}
```

The next step is to add a target. Being AWS there are dozens of options available - in this example, I'm going to use AWS Systems Manager to run a command on the EC2 instances that are affected by this updated secret. 

![Look at all of the automation](/images/cloudwatch-ssm.png)

This requires an IAM role that CloudWatch can use, with an IAM policy that enables SSM and EC2 functionality. 

*For best results shake before opening and **ensure that you are adhering to the principle of least privilege**.*

```
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Action": [
                "ssm:ListDocuments",
                "ssm:ListDocumentsVersions",
                "ssm:DescribeDocument",
                "ssm:GetDocument",
                "ssm:DescribeInstanceInformation",
                "ssm:DescribeDocumentParameters",
                "ssm:DescribeInstanceProperties"
            ],
            "Effect": "Allow",
            "Resource": "*"
        },
        {
            "Action": "ssm:SendCommand",
            "Effect": "Allow",
            "Resource": [
                "arn:aws:ec2:ap-southeast-2:*:instance/*",
                "arn:aws:ssm:ap-southeast-2:*:document/*"
            ]
        },
        {
            "Action": [
                "ssm:CancelCommand",
                "ssm:ListCommands",
                "ssm:ListCommandInvocations"
            ],
            "Effect": "Allow",
            "Resource": "*"
        },
        {
            "Action": "ec2:DescribeInstanceStatus",
            "Effect": "Allow",
            "Resource": "*"
        },
        {
            "Action": "ssm:StartAutomationExecution",
            "Effect": "Allow",
            "Resource": [
                "arn:aws:ssm:::automation-definition/"
            ]
        },
        {
            "Action": "ssm:DescribeAutomationExecutions ",
            "Effect": "Allow",
            "Resource": [
                "*"
            ]
        },
        {
            "Action": [
                "ssm:StopAutomationExecution",
                "ssm:GetAutomationExecution"
            ],
            "Effect": "Allow",
            "Resource": [
                "arn:aws:ssm:::automation-execution/"
            ]
        }
    ]
}
```

Of course, this assumes that you have onboarded your EC2 instances into AWS Systems Manager. 

## TL;DR

The upside of all of this is that whenever a specific AWS Secrets Manager secret is updated a bash command is executed on a specific group of EC2 instances (identified by a tag). I think that's pretty cool!