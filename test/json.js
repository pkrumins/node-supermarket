var Store = require('supermarket');

exports['json'] = function (assert) {
    var file = '/tmp/' + Math.floor(Math.random() * 1e8) + '.db';
    
    Store(
        { filename : file, json : true },
        function (error, db) {
            if (error) throw error;
            
            db.set('pkrumins', { age : 25, sex : 'male', location : 'latvia' },
                function (sErr) {
                    assert.ok(!sErr);
                    db.get('pkrumins', function (gErr, value) {
                        assert.ok(!gErr);
                        assert.equal(value.age, 25);
                        assert.equal(value.sex, 'male');
                        assert.equal(value.location, 'latvia');
                    });
                }
            );
            
            db.set('substack', { age : 22, sex : 'male',
                location : { country : 'usa', state : 'alaska' } }, function (sErr) {
                    assert.ok(!sErr);
                    db.get('substack', function (gErr, value) {
                        assert.ok(!gErr);
                        assert.equal(value.age, 22);
                        assert.equal(value.sex, 'male');
                        assert.equal(value.location.country, 'usa');
                        assert.equal(value.location.state, 'alaska');

                        db.forEach(function (fErr, key, val) {
                            assert.ok(!fErr);
                            assert.ok(key == 'pkrumins' || key == 'substack');
                            assert.ok(val.age == 22 || val.age == 25);
                            assert.ok(val.location == 'latvia' || val.location.country == 'usa');

                            db.filter(
                                function (key, val) {
                                    return val.age <= 22;
                                },
                                function (err, key, val) {
                                    assert.equal(key, 'substack');
                                    assert.equal(val.age, 22);
                                }
                            );
                        })
                    });
                }
            );
        }
    );
};
