var config = require('config.json');
var _ = require('lodash');
var Q = require('q');
var mongo = require('mongoskin');
var db = mongo.db(config.connectionString, { native_parser: true });
db.bind('token');

var service = {};

service.authenticate = authenticate;
service.create = create;
service.delete = _delete;
service.find = findToken;

module.exports = service;

function authenticate(token) {
    var deferred = Q.defer();

    db.token.findOne({ token: token }, function (err, tokenMsg) {
        if (err) deferred.reject(err.name + ': ' + err.message);

        if (tokenMsg) {
            // authentication successful
            deferred.resolve(tokenMsg);
        } else {
            // authentication failed
            deferred.resolve();
        }
    });

    return deferred.promise;
}

function create(author, token) {
    var deferred = Q.defer();
    // validation
    db.token.findOne(
        { token: token },
        function (err, token) {
            if (err) deferred.reject(err.name + ': ' + err.message);

            if (token) {
                // username already exists
                deferred.reject('Token ' + token + ' is already taken');
            } else {
                createToken();
            }
        });

    function createToken() {
        var objInsert = {'author': author, 'token' : token};
        db.token.insert(
            objInsert,
            function (err, doc) {
                if (err) deferred.reject(err.name + ': ' + err.message);

                deferred.resolve();
            });
    }

    return deferred.promise;
}

function _delete(author, token) {
    var deferred = Q.defer();

    db.token.remove(
        {author: author, token: token},
        function (err) {
            if (err) deferred.reject(err.name + ': ' + err.message);
            deferred.resolve('Token ' + token + ' match');
        });

    return deferred.promise;
}

function findToken(token){
    var deferred = Q.defer();
    // validation
    db.token.findOne(
        { token: token },
        function (err, token) {
            if (err) deferred.reject(err.name + ': ' + err.message);

            if (token) {
                // username already exists
                deferred.resolve('Token ' + token + ' match');
            } else {
                deferred.reject('Token ' + token + ' no match');
            }
        });
    return deferred.promise;
}