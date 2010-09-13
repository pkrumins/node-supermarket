var SQLite = require('pksqlite').Database;
var EventEmitter = require('events').EventEmitter;

module.exports = Store;
Store.prototype = new EventEmitter;
function Store(filename, cb) {
    if (!(this instanceof Store)) return new Store(filename, cb);
    if (cb === undefined) cb = function () {};
    var self = this;

    var db = new SQLite();
    db.open(filename, function (error) {
        if (error) {
            self.emit('error', error);
            cb(error);
        }
        initStoreTable();
    });

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
        if (cb === undefined) cb = function () {}
        db.query(
            "INSERT OR REPLACE INTO store (key, value) VALUES (?, ?)",
            [key, value],
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
        if (cb === undefined) cb = function () {}
        var hadRow = false;
        db.query(
            "SELECT value FROM store WHERE key = ?",
            [key],
            function (error, value) {
                if (error) {
                    self.emit('error', error);
                    cb(error);
                }
                else if (value === undefined) {
                    if (hadRow) return;
                    cb();
                }
                else {
                    cb(undefined, value.value);
                    hadRow = true;
                }
            }
        );
    };

    self.remove = function (key, cb) {
        if (cb === undefined) cb = function () {};
        db.query(
            "DELETE FROM store WHERE key = ?",
            [key],
            function (err) {
                // hmm there is no err I guess here?
                if (err) {
                    cb(err);
                }
                else {
                    // silly node-sql doesn't set rowsAffected
                    // cb(undefined, r.rowsAffected == 1);
                    cb(undefined);
                }
            }
        );
    };
};

