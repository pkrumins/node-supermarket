var Store = require('store');

Store('users.db', function (error, db) {
    if (error) throw error;

    db.set('pkrumins', 5, function (error) {
        db.get('pkrumins', function (error, value) {
            console.log('pkrumins ' + value);
        });
    });

    db.set('substack', 8, function (error) {
        db.get('substack', function (error, value) {
            console.log('substack ' + value);
        });
    });

    db.get('jesusabdullah', function (error, value) {
        console.log('jesus ' + value);
    });
});

