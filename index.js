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
 * `_files.added`. This is most useful for webhooks that act on files added or
 * modified in push events.
 * @param  {Object} payload Github webhook
 * [payload](https://developer.github.com/v3/activity/events/types/#pushevent)
 * @param {Object} [options]
 * @param {Regex} [options.matchName] only return files that match this regex.
 * @param {Regex} [options.ignoreCommit] ignore files submitted with a commit message
 * that matches this regex - useful for avoiding circular webhooks
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
 *
 * `_files.added_and_modified` array of files that have been added and
 * modified in the commits in a push event, excluding files that were added or
 * modified and subsequently deleted.
 */
function parsePayload(payload, options) {
  if (typeof payload != 'object')
    throw new TypeError('must provide a payload object');

  if (!payload.commits) return payload;

  options = options || {};
  matchNameRe = options.matchName || new RegExp('.*');
  ignoreCommitRe = options.ignoreCommit || new RegExp('a^');

  if (!(matchNameRe instanceof RegExp))
    throw new TypeError('options.matchName must be a Regular Expression');

  if (!(ignoreCommitRe instanceof RegExp))
    throw new TypeError('options.ignoreCommit must be a Regular Expression');

  var parsedPayload = clone(payload);

  // Collects a array of files that have been added and
  // modified in the commits in a push event, excluding
  // files that were added or modified and subsequently
  // deleted.
  var added_and_modified = payload.commits
    .reduce(function(previousCommit, currentCommit) {
      if (ignoreCommitRe.test(currentCommit.message)) return previousCommit;
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
      // Remove duplicates and only return files that match options.matchName
      return arr.indexOf(value) >= i && matchNameRe.test(value);
    });

  parsedPayload._files = {
    added_and_modified: added_and_modified
  };

  // Collects arrays of files that were added, modified and removed
  // in the commits in a push event.
  ['added', 'modified', 'removed'].forEach(function(type) {
    parsedPayload._files[type] = payload.commits
      .filter(function(commit) {
        return !ignoreCommitRe.test(commit.message);
      })
      .map(function(commit) {
        return commit[type];
      })
      .reduce(function(a, b) {
        // Flatten array
        return a.concat(b);
      })
      .filter(function(value, i, arr) {
        // Remove duplicates and only return files that match options.matchName
        return arr.indexOf(value) >= i && matchNameRe.test(value);
      });
  });

  return parsedPayload;
}

module.exports = parsePayload;
