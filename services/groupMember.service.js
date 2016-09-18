var config = require('config.json');
var _ = require('lodash');
var Q = require('q');
var mongo = require('mongoskin');
var db = mongo.db(config.connectionString, { native_parser: true });
db.bind('members');

var service = {};

service.create = create;
service.delete = _delete;
service.find = find;

module.exports = service;

function create(author, token) {
    var deferred = Q.defer();
    // validation
    db.token.findOne(
        { TOKEN: token },
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
        var objInsert = {'AUTHOR': author, 'TOKEN' : token};
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
        {AUTHOR: author, TOKEN: token},
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
        { TOKEN: token },
        function (err, token) {
            if (err) deferred.reject(err.name + ': ' + err.message);

            if (token) {
                // token already exists
                deferred.resolve('Token ' + token + ' match');
            } else {
                deferred.reject('Token ' + token + ' no match');
            }
        });
    return deferred.promise;
}

function checkTokenAuthor(author, token){
    var deferred = Q.defer();
    var flag;

    // validation
    db.token.findOne(
        { TOKEN: token , AUTHOR: author},
        function (err, token) {
            if (err) deferred.reject(err.name + ': ' + err.message);

            if (token) {
                // validate success
                flag = {success: true};
                deferred.resolve(flag);
            } else {
                deferred.reject('Token ' + token + ' no match');
            }
        });
    return deferred.promise;
}