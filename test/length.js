var Store = require('supermarket');

exports['length'] = function (assert) {
    Store(':memory:', function (err, db) {
        assert.ok(!err);

        range(0,100).forEach(function (i) {
            db.set(i, i, function (err, k, v) {
                assert.ok(!err);
                if (v == 99) {
                    db.length(function (err, len) {
                        assert.ok(!err);
                        assert.equal(len, 100);
                    });
                }
            });
        });
    });
};

function range(i, j) {
    var ret = [];
    for (; i<j; i++) ret.push(i);
    return ret;
}

