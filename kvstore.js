var SQLite = require('sqlite').Database;
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
        var hadTable = false;
        db.query(
            "SELECT * FROM SQLITE_MASTER WHERE type='table' AND name='store'",
            function (error, row) {
                if (error) {
                    self.emit('error', error);
                    cb(error);
                }
                if (row === undefined) {
                    if (hadTable) {
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
                hadTable = true;
            }
        );
    }

    self.set = function (key, value, cb) {
        if (cb === undefined) cb = function () {}
        db.query(
            "INSERT INTO store (key, value) VALUES (?, ?)",
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
    }

    self.get = function (key, cb) {
        if (cb === undefined) cb = function () {}
        db.query(
            "SELECT value FROM store WHERE key = ?",
            [key],
            function (error, value) {
                if (error) {
                    self.emit('error', error);
                    cb(error);
                }
                else {
                    cb(undefined, value);
                }
            }
        );
    }
};

