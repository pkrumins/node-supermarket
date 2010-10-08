var SQLite = require('pksqlite').Database;
var EventEmitter = require('events').EventEmitter;
var normalize = require('path').normalize;

var openDbs = {};

module.exports = Store;
Store.prototype = new EventEmitter;
function Store(opts, cb) {
    if (!(this instanceof Store)) return new Store(opts, cb);
    if (cb === undefined) cb = function () {};
    var self = this;
    var actionQueue = [];
    var ready = false;

    if (typeof opts === 'string') {
        var opts = {
            filename : opts,
            json : false
        }
    }

    if (opts.filename === undefined)
        throw new Error('Filename was not specified');

    if (opts.filename != ':memory:') {
        if (opts.filename[0] != '/')
            opts.filename = process.cwd() + '/' + opts.filename;

        opts.filename = normalize(opts.filename);
        
        if (openDbs[opts.filename]) {
            var db = openDbs[opts.filename];
            cb(undefined, db);
            return;
        }
    }
    
    opts.json = opts.json || false;

    self.on('ready', function () {
        ready = true;
        actionQueue.forEach(function (action) {
            self[action.action].apply(self, action.args);
        });
        delete actionQueue;
    });

    var db = new SQLite();
    db.open(opts.filename, function (error) {
        if (error) {
            self.emit('error', error);
            delete openDbs[opts.filename];
            cb(error);
        }
        initStoreTable();
    });
    openDbs[opts.filename] = self;
 
    function initStoreTable() {
        var hadRow = false;
        db.query(
            "SELECT * FROM SQLITE_MASTER WHERE type='table' AND name='store'",
            function (error, row) {
                if (error) {
                    self.emit('error', error);
                    cb(error);
                    return;
                }
                if (row === undefined) {
                    if (hadRow) {
                        self.emit('ready');

                        cb(undefined, self);
                    }
                    else {
                        db.query(
                            "CREATE TABLE store (key TEXT UNIQUE, value BLOB)",
                            function (error) {
                                if (error) {
                                    self.emit('error', error);
                                    cb(error);
                                }
                                else {
                                    self.emit('ready');
                                    cb(undefined, self);
                                }
                            }
                        );
                    }
                }
                hadRow = true;
            }
        );
    }

    function queue(action, args) {
        actionQueue.push({ action : action, args : [].slice.call(args) });
    }

    self.set = function (key, value, cb) {
        if (!ready) { 
            queue('set', arguments);
            return;
        }
        if (cb === undefined) cb = function () {}
        db.query(
            "INSERT OR REPLACE INTO store (key, value) VALUES (?, ?)",
            [key, opts.json ? JSON.stringify(value) : value],
            function (error) {
                if (error) {
                    self.emit('error', error);
                    cb(error);
                }
                else {
                    cb(undefined, key, value);
                }
            }
        );
    };

    self.get = function (key, cb) {
        if (!ready) {
            queue('get', arguments);
            return;
        }
        if (cb === undefined) cb = function () {}
        var hadRow = false;
        db.query(
            "SELECT value FROM store WHERE key = ?",
            [key],
            function (error, row) {
                if (error) {
                    self.emit('error', error);
                    cb(error);
                }
                else if (row === undefined) {
                    if (hadRow) return;
                    cb();
                }
                else {
                    cb(undefined, opts.json ? JSON.parse(row.value) : row.value, row.key);
                    hadRow = true;
                }
            }
        );
    };

    self.remove = function (key, cb) {
        if (!ready) {
            queue('remove', arguments);
            return;
        }
        if (cb === undefined) cb = function () {};
        db.query(
            "DELETE FROM store WHERE key = ?",
            [key],
            function (error) {
                if (error) {
                    self.emit('error', error)
                    cb(error);
                }
                else {
                    // silly node-sql doesn't set rowsAffected
                    // cb(undefined, r.rowsAffected == 1);
                    cb(undefined);
                }
            }
        );
    };

    self.filter = function (pred, cb, done) {
        if (!ready) {
            queue('filter', arguments);
            return;
        }
        if (cb === undefined) cb = function () {};
        if (done === undefined) done = function () {};
        db.query(
            "SELECT * FROM store",
            function (error, row) {
                if (error) {
                    self.emit('error', error);
                    cb(error);
                }
                else if (row === undefined) {
                    done();
                }
                else {
                    var value = opts.json ? JSON.parse(row.value) : row.value;
                    if (pred(row.key, value)) {
                        cb(undefined, row.key, value);
                    }
                }
            }
        );
    }

    self.length = function (cb) {
        if (!ready) {
            queue('length', arguments);
            return;
        }
        if (cb === undefined) cb = function () {};
        db.query(
            "SELECT COUNT(*) as count FROM store",
            function (error, row) {
                if (error) {
                    self.emit('error', error);
                    cb(error);
                }
                else if (row) {
                    cb(undefined, row.count);
                }
            }
        );
    }

    self.forEach = function (cb, done) {
        if (!ready) {
            queue('forEach', arguments);
            return;
        }
        if (cb === undefined) cb = function () {};
        if (done === undefined) done = function () {};
        db.query(
            "SELECT * FROM store",
            function (error, row) {
                if (error) {
                    self.emit('error', error);
                    cb(error);
                }
                else if (row === undefined) {
                    done();
                }
                else {
                    cb(undefined, row.key, opts.json ? JSON.parse(row.value) : row.value);
                }
            }
        );
    }

    self.all = function (cb) {
        if (!ready) {
            queue('all', arguments);
            return;
        }
        var keys = [];
        var vals = [];
        self.forEach(
            function (error, key, val) {
                if (error) {
                    self.emit('error');
                    cb(error);
                }
                keys.push(key);
                vals.push(val);
            },
            function () {
                cb(undefined, keys, vals);
            }
        );
    }
};

