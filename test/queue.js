var Store = require('supermarket');

exports['get/set'] = function (assert) {
    var file = '/tmp/' + Math.floor(Math.random() * 1e8) + '.db';
    
    var db = Store(file);

    db.set('moo', 5, function (sErr) {
        assert.ok(!sErr);
    });

    db.get('moo', function (gErr, val, key) {
        assert.equal(val, 5);
        assert.equal(key, 'moo');
    });
};
