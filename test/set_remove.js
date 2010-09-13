var Store = require('supermarket');

exports['set/remove'] = function (assert) {
    var file = '/tmp/' + Math.floor(Math.random() * 1e8) + '.db';
    
    Store(file, function (error, db) {
        if (error) throw error;
        
        db.set('o_O', 50, function (sErr) {
            assert.ok(!sErr);
            db.remove('o_O', function (rErr) {
                assert.ok(!rErr);
                // no way to check if the key was removed for now
                // assert.ok(r);
                db.get('o_O', function (gErr, value) {
                    assert.ok(!gErr);
                    assert.equal(arguments.length, 0);
                });
            });
        });
    });
};
