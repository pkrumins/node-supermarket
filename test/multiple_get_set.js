var Store = require('supermarket');

exports['multiple set/get'] = function (assert) {
    var file = '/tmp/' + Math.floor(Math.random() * 1e8) + '.db';

    Store(file, function (error, db) {
        if (error) throw error;

        for (x in range(0,100)) {
            var key = 'key' + (x).toString();
            db.set(key, x, function (sErr) {
                assert.ok(!sErr);
                db.get(key, function (gErr, val) {
                    assert.ok(!gErr);
                    assert.equal(val, x);
                });
            });
        }
    });
};

function range(i, j) {
    var ret = [];
    for (; i<j; i++) ret.push(i);
    return ret;
}

