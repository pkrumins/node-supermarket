var Store = require('supermarket');

exports['multiple set/get'] = function (assert) {
    var db1 = Store('/tmp/moo.db');
    var db2 = Store('/tmp/moo.db');

    db1.set('x', 5);
    db2.get('x', function (err, x) {
        assert.equal(x, 5);
    });
};

