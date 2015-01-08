var clone = require('clone');

module.exports = function(payload) {
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
};
