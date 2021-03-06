#!/bin/bash

printf "\n updating css cache-control\n"
aws s3 cp \
  --only-show-errors \
  --recursive \
  --acl public-read \
  --region ap-southeast-2 \
  --cache-control "max-age=604800" \
  --metadata-directive="REPLACE" \
  s3://michaelgreenhill-net/css s3://michaelgreenhill-net/css

printf "\n updating images cache-control\n"
aws s3 cp \
  --only-show-errors \
  --recursive \
  --acl public-read \
  --region ap-southeast-2 \
  --cache-control "max-age=2419200" \
  --metadata-directive="REPLACE" \
  s3://michaelgreenhill-net/images s3://michaelgreenhill-net/images

printf "\n updating service worker cache-control\n"
aws s3 cp \
  --only-show-errors \
  --acl public-read \
  --region ap-southeast-2 \
  --cache-control "no-cache" \
  --metadata-directive="REPLACE" \
  s3://michaelgreenhill-net/service-worker.js s3://michaelgreenhill-net/service-worker.js

printf "\n updating index.html cache-control\n"
aws s3 cp \
  --only-show-errors \
  --acl public-read \
  --region ap-southeast-2 \
  --cache-control "max-age=3600" \
  --metadata-directive="REPLACE" \
  s3://michaelgreenhill-net/index.html s3://michaelgreenhill-net/index.html

printf "\n updating feed.xml cache-control\n"
aws s3 cp \
  --only-show-errors \
  --acl public-read \
  --region ap-southeast-2 \
  --cache-control "max-age=3600" \
  --metadata-directive="REPLACE" \
  s3://michaelgreenhill-net/feed.xml s3://michaelgreenhill-net/feed.xml