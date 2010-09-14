var Store = require('supermarket');

exports['all'] = function (assert) {
    Store(':memory:', function (err, db) {
        assert.ok(!err);

        range(0,100).forEach(function (i) {
            var key = 'key' + (i).toString();
            db.set(key, i, function (err, k, v) {
                assert.ok(!err);
                if (v == 99) {
                    test_all();
                }
            });
        });

        function test_all() {
            var expectedKeys = [];
            var expectedVals = [];
            range(0,100).forEach(function (i) {
                expectedKeys.push('key' + (i).toString());
                expectedVals.push(i);
            });
            db.all(function (err, keys, vals) {
                function sorter(a,b) { return a-b }
                assert.eql(expectedKeys.sort(), keys.sort());
                assert.eql(expectedVals, vals.sort(sorter));
            });
        }
    });
}

function range(i, j) {
    var ret = [];
    for (; i<j; i++) ret.push(i);
    return ret;
}

