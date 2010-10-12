var Store = require('supermarket');

exports['foreach'] = function (assert) {
    Store(':memory:', function (err, db) {
        assert.ok(!err);

        range(0,100).forEach(function (i) {
            var key = 'key' + (i).toString();
            db.set(key, i, function (err, k, v) {
                assert.ok(!err);
                if (v == 99) {
                    test_foreach();
                }
            });
        });

        function test_foreach() {
            var expectedSum = 99*(99+1)/2;
            var runningSum = 0;
            db
                .forEach(function (row) {
                    runningSum += row.value;
                })
                .on('error', assert.fail)
                .on('end', function () {
                    assert.equal(expectedSum, runningSum);
                })
            ;
        }
    });
}

function range(i, j) {
    var ret = [];
    for (; i<j; i++) ret.push(i);
    return ret;
}

