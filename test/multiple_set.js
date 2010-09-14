var Store = require('supermarket');
var file = '/tmp/' + Math.floor(Math.random() * 1e8) + '.db';

exports['multiple set'] = function (assert) {
    Store(file, function (error, db) {
        if (error) throw error;

        range(0,100).forEach(function (x) {
            var key = 'key' + (x).toString();
            db.set(key, x, function (sErr) {
                assert.ok(!sErr);
                if (x == 99) {
                    range(0,100).forEach(function (y) {
                        var key = 'key' + (y).toString();
                        db.get(key, function (gErr, val) {
                            assert.ok(!gErr);
                            assert.equal(y, val);
                        });
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

