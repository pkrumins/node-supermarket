This is a key/value store based on sqlite for node.js that actually works.

It was written by Peteris Krumins (peter@catonmat.net).
His blog is at http://www.catonmat.net  --  good coders code, great reuse.

------------------------------------------------------------------------------

It's very simple to use, first import the module:

    var Store = require('supermarket');

Then create a new instance of Store, passing in the database filename and
continuation that gets called when the database has been opened,

    Store('users.db', function (error, db) {
        // ... you can use db here ... check for error, too ...
    });

It provides .set and .get methods that are also continuations,

    Store('users.db', function (db) {
        db.set('pkrumins', 'cool dude', function (error) {
            // value 'pkrumins' is now set to 'cool dude'
            db.get('pkrumins', function (error, value) {
                console.log(value); // cool dude
            });
        });
    });

See tests/ directory for more info.

This library doesn't end here, our (my and substack's) is to create an object
store, where you can just dump the whole js objects, and then restore them back,
map, filter and fold on them, etc.

------------------------------------------------------------------------------

Have fun storing those keys and values!


Sincerely,
Peteris Krumins
http://www.catonmat.net

