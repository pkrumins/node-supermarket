var Store = require('supermarket');

exports['get/set'] = function (assert) {
    var file = '/tmp/' + Math.floor(Math.random() * 1e8) + '.db';
    
    Store(file, function (error, db) {
        if (error) throw error;
        
        db.set('pkrumins', 5, function (sErr) {
            assert.ok(!sErr);
            db.get('pkrumins', function (gErr, value) {
                assert.ok(!gErr);
                assert.equal(value, 5);
            });
        });
        
        db.set('substack', 8, function (sErr) {
            assert.ok(!sErr);
            db.get('substack', function (gErr, value) {
                assert.ok(!gErr);
                assert.equal(value, 8);
            });
        });

        db.get('jesusabdullah', function (err, value) {
            assert.ok(!err);
            assert.equal(value, undefined);
        });
    });
};
