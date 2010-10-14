var SQLite = require('pksqlite').Database;
var EventEmitter = require('events').EventEmitter;
var normalize = require('path').normalize;
var Lazy = require('lazy');

var openDbs = {};

module.exports = Store;
Store.prototype = new EventEmitter;
function Store(opts, cb) {
    if (!(this instanceof Store)) return new Store(opts, cb);
    if (cb === undefined) cb = function () {};
    var self = this;

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
    } 
    
    opts.json = opts.json || false;

    var actionQueue = [];
    var ready = false;
 
    function queue(action, args) {
        actionQueue.push({ action : action, args : [].slice.call(args) });
    }

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

    self.set = function (key, value, cb) {
        if (!ready) { 
            queue(self.set, arguments);
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
            queue(self.get, arguments);
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
                    cb(undefined, opts.json ? JSON.parse(row.value) : row.value, key);
                    hadRow = true;
                }
            }
        );
    };

    self.remove = function (key, cb) {
        if (!ready) {
            queue(self.remove, arguments);
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

    self.length = function (cb) {
        if (!ready) {
            queue(self.length, arguments);
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
    
    Object.keys(Lazy()).forEach(function (name) {
        self[name] = function () {
            var lazy = Lazy(self.stream());
            return lazy[name].apply(lazy, arguments);
        }
    });
    
    self.stream = function (emitter) {
        if (!emitter) emitter = new EventEmitter;
        
        if (!ready) {
            queue(self.stream.bind(self,emitter), arguments);
            return emitter;
        }
        
        db.query(
            "SELECT * FROM store",
            function (error, row) {
                if (error) {
                    emitter.emit('error', error);
                    self.emit('error', error);
                }
                else if (row === undefined) {
                    emitter.emit('end');
                }
                else {
                    emitter.emit('data', {
                        key : row.key,
                        value : opts.json ? JSON.parse(row.value) : row.value,
                    });
                }
            }
        );
        
        return emitter;
    }

    self.all = function (cb) {
        if (!ready) {
            queue(self.all, arguments);
            return;
        }
        self
            .on('error', function (err) {
                self.emit('error', err);
                cb(err);
            })
            .join(function (rows) { cb(
                undefined,
                rows.map(function (r) { return r.key }),
                rows.map(function (r) { return r.value })
            ) })
        ;
    };

    self.on('ready', function () {
        ready = true;
        actionQueue.forEach(function (action) {
            action.action.apply(self, action.args);
        });
        delete actionQueue;
    });

    if (openDbs[opts.filename]) {
        var db = openDbs[opts.filename];
        cb(undefined, db);
        return;
    }
    else {
        var db = new SQLite();
        db.open(opts.filename, function (error) {
            if (error) {
                self.emit('error', error);
                delete openDbs[opts.filename];
                cb(error);
            }
            initStoreTable();
        });
        if (opts.filename != ':memory:')
            openDbs[opts.filename] = self;
    }
};

