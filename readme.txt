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

    Store('users.db', function (err, db) {
        db.set('pkrumins', 'cool dude', function (error) {
            // value 'pkrumins' is now set to 'cool dude'
            db.get('pkrumins', function (error, value, key) {
                console.log(value); // cool dude
            });
        });
    });

If you wish to store JSON objects in the database, you may pass a dict with the
key 'json' set to true and the key 'filename' for file as the first argument to
Store,

    Store({ filename : 'objects.db', json : true },
        function (error, db) {
            // now any .set and .get operations will call JSON.stringify
            // and JSON.parse on values.
    	}
    );

------------.
| Outdated: | The following docs are outdated as we just moved supermarket to node-lazy!
'-----------'

It also has .filter function that takes a predicate, callback and done function.
The .filter function calls callback on each row for which predicate is true.
After it's done filtering, it calls done function.

Here is an example:

    Store({ filename : 'users.db', json : true }, function (err, db) {
        var users = [];
        db.filter(
            function (user, userInfo) { //1//
                return userInfo.age < 20
            },
            function (err, user, userInfo) { //2//
                if (err) throw err;
                users.push(userInfo);
            },
            function () { //3//
                console.log("Users younger than 20:");
                users.forEach(function (user) {
                    console.log(user.name);
                });
            }
        );
    });

The filter function here takes the predicate function //1//, parses each record and
returns true if user's age is less than 20.
Now if the age is less than 20, filter calls callback function //2//, which adds each
user who's younger than 20 to users array.
Once filter has gone through all the records it calls done function //3//, which then
prints out all usernames of youngters.

Store also has .forEach method that iterates over all of its values,

    Store({ filename: 'users.db', json : true }, function (db) {
        db.forEach(
            function (err, key, val) {
                if (err) throw err;
                console.log("User " + key + " is " + val.age + " old.");
            },
            function () {
                console.log("Done with all users.");
            }
        );
    });

forEach takes a callback and done function. Very similar to .filter.

It also has .all method that returns all keys and all values,

    Store('users.db', function (db) {
        db.all(function (err, users, userInfos) {
            // all users in users (keys)
            // all user infos in userInfos (values)
        });
    });


Another method is .length that returns the number of elements in the store,

    Store('users.db', function (db) {
        db.length(function (len) {
            console.log("There are " + len + " users in users.db database");
        });
   });
    
This library doesn't end here, our (my and substack's) is to create an object
store, where you can just dump the whole js objects, and then restore them back,
map, filter and fold on them, etc.

------------------------------------------------------------------------------

Have fun storing those keys and values!


Sincerely,
Peteris Krumins
http://www.catonmat.net

