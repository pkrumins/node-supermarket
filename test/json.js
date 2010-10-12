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

                        db
                        .on('error', assert.fail)
                        .forEach(function (row) {
                            var key = row.key, val = row.value;
                            assert.ok(key == 'pkrumins' || key == 'substack');
                            assert.ok(val.age == 22 || val.age == 25);
                            assert.ok(val.location == 'latvia' || val.location.country == 'usa');

                            db
                                .filter(function (row) {
                                    return row.value.age <= 22;
                                })
                                .join(function (rows) {
                                    assert.equal(rows.length, 1);
                                    assert.equal(rows[0].key, 'substack');
                                    assert.equal(rows[0].value.age, 22);
                                    
                                    db.all(function (aErr, keys, vals) {
                                        assert.ok(!aErr);
                                        assert.equal(keys.length, 2);
                                        assert.equal(vals.length, 2);
                                        assert.ok('pkrumins' == keys[0] || 'pkrumins' == keys[1]);
                                        assert.ok('substack' == keys[0] || 'substack' == keys[1]);
                                    });
                                })
                            ;
                        })
                    });
                }
            );
        }
    );
};
