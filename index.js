var clone = require('clone');

/**
 * Parses a [Github webhook
 * payload](https://developer.github.com/webhooks/#payloads) returning a clone
 * of the payload with additional useful properties.
 *
 * Right now it only does anything with the [push
 * event](https://developer.github.com/v3/activity/events/types/#pushevent)
 * adding a property `_files` with arrays of files that have been added,
 * modified and removed by the push event.
 *
 * ### Why?
 *
 * If you want to act on added or modified files that are present in the most
 * recent commit. A single push event might include commits that add then
 * delete a file. In this case that file would not be included in
 * `_files.added`.
 * @param  {Object} payload Github webhook
 * [payload](https://developer.github.com/v3/activity/events/types/#pushevent)
 * @return {parsedPayload}         a new parsedPayload with the `_files`
 * property.
 *
 * `_files.modified` Array of files in push event commits, with duplicates
 * removed and any files that were removed in a later commit also removed.
 *
 * `_files.removed` Array of files removed from the repo in the commits in the
 * push event, duplicates removed.
 *
 * `_files.added` Array of files added to and modified in the repo, with
 * duplicates removed and any files that were removed in a later commit also
 * removed.
 */
function parsePayload(payload) {
  if (typeof payload != 'object')
    throw new TypeError('must provide a payload object');

  if (!payload.commits) return payload;

  var parsedPayload = clone(payload);

  // Collects a array of files that have been added and
  // modified in the commits in a push event, excluding
  // files that were added or modified and subsequently
  // deleted.
  var added_and_modified = payload.commits
    .reduce(function(previousCommit, currentCommit) {
      return previousCommit
        .concat(currentCommit.modified)
        .concat(currentCommit.added)
        .filter(function(value) {
          // If an added or modified file is subsequently deleted, 
          // remove it from the output.
          return currentCommit.removed.indexOf(value) === -1;
        });
    }, [])
    .filter(function(value, i, arr) {
      // Remove duplicates
      return arr.indexOf(value) >= i;
    });

  parsedPayload._files = {
    added_and_modified: added_and_modified
  };

  // Collects arrays of files that were added, modified and removed
  // in the commits in a push event.
  ['added', 'modified', 'removed'].forEach(function(type) {
    parsedPayload._files[type] = payload.commits
      .map(function(commit) {
        return commit[type];
      })
      .reduce(function(a, b) {
        // Flatten array
        return a.concat(b);
      })
      .filter(function(value, i, arr) {
        // Remove duplicates
        return arr.indexOf(value) >= i;
      });
  });

  return parsedPayload;
}

module.exports = parsePayload;
