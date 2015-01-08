[![Build Status](https://travis-ci.org/digidem/parse-github-webhook.svg)](https://travis-ci.org/digidem/parse-github-webhook)

Github Webhook Parser
=====================

Parses a [Github webhook payload](https://developer.github.com/webhooks/#payloads) returning a clone of the payload with additional useful properties.

Right now it only does anything with the [push event](https://developer.github.com/v3/activity/events/types/#pushevent) adding a property `_files` with arrays of files that have been added, modified and removed by the push event.

## Usage

```javascript
var parse = require('parse-github-webhook');

var payload = parse(githubPushEventPayload);

console.log(payload._files);
```

## Properties

### payload._files.added

An array of new files added to the repo by the commits in the push event, with duplicates removed.

### payload._files.modified

An array of modified files in the commits in the push event, with duplicates removed.

### payload._files.removed

An array of files removed from the repo in the commits in the push event, duplicates removed.

### payload._files.added_and_modified

An array of all the files added to and modified in the repo, with duplicates removed and any files that were removed in a later commit also removed.

## Running tests

`npm test`
