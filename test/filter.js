var Store = require('supermarket');

exports['filter'] = function (assert) {
    Store(':memory:', function (err, db) {
        assert.ok(!err);

        range(0,100).forEach(function (i) {
            var key = 'key' + (i).toString();
            db.set(key, i, function (err, k, v) {
                assert.ok(!err);
                if (v == 99) {
                    test_evens();
                }
            });
        });

        function test_evens() {
            var evens = [];
            db.filter(
                function (key, val) { return val % 2 == 0 },
                function (err, key, val) {
                    assert.ok(!err);
                    evens.push(val);
                },
                function () {
                    function sorter(a,b) { return a-b }
                    assert.eql(
                        evens.sort(sorter),
                        range(0,100).filter(function (i) { return i % 2 == 0 })
                    );
                }
            );
        }
    });
}

function range(i, j) {
    var ret = [];
    for (; i<j; i++) ret.push(i);
    return ret;
}

