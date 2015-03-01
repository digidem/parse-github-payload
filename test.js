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

test('Only files that match options.matchName are returned', function(t) {
    var payload = {
        commits: [{
            added: ['a.js'],
            modified: ['b.xml'],
            removed: ['c.js'],
        },{
            added: ['d.md'],
            modified: ['e.js'],
            removed: ['f.txt']
        }]
    };

    var parsed = parse(payload, { matchName: /.*\.js$/ });

    t.plan(4);

    t.deepEqual(parsed._files.added_and_modified.sort(), ['a.js', 'e.js'], 'added_and_modified');
    t.deepEqual(parsed._files.added.sort(), ['a.js'], 'added');
    t.deepEqual(parsed._files.modified.sort(), ['e.js'], 'modified');
    t.deepEqual(parsed._files.removed.sort(), ['c.js'], 'removed');
});

test('Only files commits that do not match options.ignoreCommit are returned', function(t) {
    var payload = {
        commits: [{
            message: '[WEBHOOK] commit by automated webhook',
            added: ['a.js'],
            modified: ['b.xml'],
            removed: ['c.js'],
        },{
            message: 'A human commit',
            added: ['d.md'],
            modified: ['e.js'],
            removed: ['f.txt']
        }]
    };

    var parsed = parse(payload, { ignoreCommit: /^\[WEBHOOK\]/ });

    t.plan(4);

    t.deepEqual(parsed._files.added_and_modified.sort(), ['d.md', 'e.js'], 'added_and_modified');
    t.deepEqual(parsed._files.added.sort(), ['d.md'], 'added');
    t.deepEqual(parsed._files.modified.sort(), ['e.js'], 'modified');
    t.deepEqual(parsed._files.removed.sort(), ['f.txt'], 'removed');
});

test('Only files commits that do not match options.ignoreCommit are returned', function(t) {
    var payload = require('./fixture.json');

    var parsed = parse(payload, { ignoreCommit: /^\[RESIZE-WEBHOOK\]/ });

    t.plan(4);

    t.equal(parsed._files.added_and_modified.length, 0, 'added_and_modified');
    t.equal(parsed._files.added.length, 0, 'added');
    t.equal(parsed._files.modified.length, 0, 'modified');
    t.equal(parsed._files.removed.length, 0, 'removed');
});
