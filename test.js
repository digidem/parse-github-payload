var test = require('tape');

var parse = require('./');

test('Parser without a payload object throws', function(t) {
    t.plan(2);

    t.equal(typeof parse, 'function', 'parser is a function');

    t.throws(parse, /must provide a payload object/, 'throws if no payload');
});

test('Parser does nothing if payload has no commits', function(t) {
    var payload = {};

    t.plan(1);

    t.deepEqual(parse(payload), payload, 'parsed payload is the same as original payload');
});

test('Added, modified and removed files are concatenated', function(t) {
    var payload = {
        commits: [{
            added: ['a'],
            modified: ['b'],
            removed: ['c'],
        },{
            added: ['d'],
            modified: ['e'],
            removed: ['f']
        }]
    };

    var parsed = parse(payload);

    t.plan(4);

    t.deepEqual(parsed._files.added, ['a', 'd'], 'added files are concatenated');
    t.deepEqual(parsed._files.modified, ['b', 'e'], 'modified files are concatenated');
    t.deepEqual(parsed._files.removed, ['c', 'f'], 'removed files are concatenated');
    t.deepEqual(parsed._files.added_and_modified.sort(), 'abde'.split(''), 'added_and_modified are concatenated');
});

test('Duplicate files are removed', function(t) {
    var payload = {
        commits: [{
            added: ['a'],
            modified: ['b'],
            removed: ['c'],
        },{
            added: ['a'],
            modified: ['b'],
            removed: ['c']
        }]
    };

    var parsed = parse(payload);

    t.plan(4);

    t.deepEqual(parsed._files.added, ['a'], 'duplicate added files are removed');
    t.deepEqual(parsed._files.modified, ['b'], 'duplicate modified files are removed');
    t.deepEqual(parsed._files.removed, ['c'], 'duplicate removed files are removed');
    t.deepEqual(parsed._files.added_and_modified.sort(), ['a', 'b'], 'duplicate added_and_modified files are removed');
});

test('Added or modified files subsequently removed are filtered from added_and_modified', function(t) {
    var payload = {
        commits: [{
            added: ['a'],
            modified: ['b'],
            removed: []
        },{
            added: ['c'],
            modified: ['d'],
            removed: ['a']
        },{
            added: [],
            modified: [],
            removed: ['d']
        }]
    };

    var parsed = parse(payload);

    t.plan(1);

    t.deepEqual(parsed._files.added_and_modified.sort(), ['b', 'c'], 'removed files were filtered');
});
