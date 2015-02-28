# parse-github-payload

[![build status](https://secure.travis-ci.org/digidem/parse-github-payload.png)](http://travis-ci.org/digidem/parse-github-payload)

Parses a github push event payload adding a list of files added, modified and removed to the payload


### `parsePayload(payload, [options], [options.matchName], [options.ignoreCommit])`

Parses a [Github webhook
payload](https://developer.github.com/webhooks/#payloads) returning a clone
of the payload with additional useful properties.

Right now it only does anything with the [push
event](https://developer.github.com/v3/activity/events/types/#pushevent)
adding a property `_files` with arrays of files that have been added,
modified and removed by the push event.

### Why?

If you want to act on added or modified files that are present in the most
recent commit. A single push event might include commits that add then
delete a file. In this case that file would not be included in
`_files.added`. This is most useful for webhooks that act on files added or
modified in push events.

### Parameters

| parameter                | type   | description                                                                                                              |
| ------------------------ | ------ | ------------------------------------------------------------------------------------------------------------------------ |
| `payload`                | Object | Github webhook [payload](https://developer.github.com/v3/activity/events/types/#pushevent)                               |
| `[options]`              | Object | _optional:_                                                                                                              |
| `[options.matchName]`    | Regex  | _optional:_ only return files that match this regex.                                                                     |
| `[options.ignoreCommit]` | Regex  | _optional:_ ignore files submitted with a commit message that matches this regex - useful for avoiding circular webhooks |



**Returns** `parsedPayload`, a new parsedPayload with the `_files` property.

`_files.modified` Array of files in push event commits, with duplicates
removed and any files that were removed in a later commit also removed.

`_files.removed` Array of files removed from the repo in the commits in the
push event, duplicates removed.

`_files.added` Array of files added to and modified in the repo, with
duplicates removed and any files that were removed in a later commit also
removed.

`_files.added_and_modified` array of files that have been added and
modified in the commits in a push event, excluding files that were added or
modified and subsequently deleted.

## Installation

Requires [nodejs](http://nodejs.org/).

```sh
$ npm install parse-github-payload
```

## Tests

```sh
$ npm test
```


