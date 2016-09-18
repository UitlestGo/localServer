var config = require('config.json');
var _ = require('lodash');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var Q = require('q');
var mongo = require('mongoskin');
var db = mongo.db(config.connectionString, { native_parser: true });
db.bind('users');

var service = {};

service.authenticate = authenticate;
service.getById = getById;
service.create = create;
service.update = update;
service.delete = _delete;
service.updateDynamicCode = updateDynamicCode;
service.validateDynamicCode = validateDynamicCode;
service.newPassword = newPassword;
service.updatePassword = updatePassword;

module.exports = service;

function authenticate(username, password) {
    var deferred = Q.defer();

    db.users.findOne({ USERNAME: username }, function (err, user) {
        if (err) deferred.reject(err.name + ': ' + err.message);

        if (user && bcrypt.compareSync(password, user.hash)) {
            // authentication successful
            deferred.resolve(_.omit(user, 'hash' ,'STATUS', 'LOCK'));
        } else {
            // authentication failed
            deferred.resolve();
        }
    });

    return deferred.promise;
}

function getById(_id) {
    var deferred = Q.defer();

    db.users.findById(_id, function (err, user) {
        if (err) deferred.reject(err.name + ': ' + err.message);

        if (user) {
            // return user (without hashed password)
            deferred.resolve(user);
        } else {
            // user not found
            deferred.resolve();
        }
    });

    return deferred.promise;
}

function create(userParam) {
    var deferred = Q.defer();

    // validation
    db.users.findOne(
        { USERNAME: userParam.username },
        function (err, user) {
            if (err) deferred.reject(err.name + ': ' + err.message);

            if (user) {
                // username already exists
                deferred.reject('Username ' + userParam.username + ' is already taken');
            } else {
                createUser();
            }
        });

    function createUser() {
        // set user object to userParam without the cleartext password
        var set = {
            USERNAME:userParam.username,
            PASSWORD:userParam.password,
            PHONE:userParam.phone,
            EMAIL: userParam.email,
            FIRSTNAME: "",
            LASTNAME: "",
            BIRTHDAY: "",
            GENDER: "",
            ADDRESS: "",
            DYNAMICCODE: "",
            STATUS: "0",
            LOCK: "0",
            CREATEDATE: new Date(),
            UPDATEDATE: new Date()
        };
        var user = _.omit(set, 'PASSWORD');

        // add hashed password to user object
        user.hash = bcrypt.hashSync(userParam.password, 10);

        db.users.insert(
            user,
            function (err, doc) {
                if (err) deferred.reject(err.name + ': ' + err.message);

                deferred.resolve();
            });
    }

    return deferred.promise;
}

function update(_id, userParam) {
    var deferred = Q.defer();

    console.log("update user: " +  _id);

    // validation
    db.users.findById(_id, function (err, user) {
        if (err) deferred.reject(err.name + ': ' + err.message);

        if (user) {
            updateUser();
        } else {
            deferred.reject("Account not found");
        }
    });

    function updateUser() {
        // fields to update
        var set = {
            FIRSTNAME: userParam.firstname,
            LASTNAME: userParam.lastname,
            BIRTHDAY: userParam.birthday,
            GENDER: userParam.gender,
            ADDRESS: userParam.address,
            UPDATEDATE: new Date()
        };

        db.users.update(
            { _id: mongo.helper.toObjectID(_id) },
            { $set: set },
            function (err, doc) {
                if (err) deferred.reject(err.name + ': ' + err.message);

                deferred.resolve();
            });
    }

    return deferred.promise;
}

function validateDynamicCode(_id, code){
    var deferred = Q.defer();

    // validation
    db.users.findById(_id, function (err, user) {
        if (err) deferred.reject(err.name + ': ' + err.message);

        if (user && user.DYNAMICCODE == code) {
            // return user (without hashed password)
            updateStatus();
        } else {
            // user not found
            deferred.reject("Validate code failure");
        }
    });

    function  updateStatus() {
        // fields to update
        var set = {
            STATUS: "1"
        };

db.users.update(
    { _id: mongo.helper.toObjectID(_id) },
    { $set: set },
    function (err, doc) {
        if (err) deferred.reject(err.name + ': ' + err.message);

        flag = {success: true};
        deferred.resolve(flag);
    });

}

return deferred.promise;
}

function newPassword(_id, password){
    var deferred = Q.defer();

    // validation
    db.users.findOne({ _id: mongo.helper.toObjectID(_id) , STATUS:"1" }, function (err, user) {
        if (err) deferred.reject(err.name + ': ' + err.message);

        if (user) {
            updateUser();
        } else {
            deferred.reject("Account not found");
        }
    });

    function updateUser() {
        // fields to update
        // add hashed password to user object

        var set = {
            hash: bcrypt.hashSync(password, 10),
            STATUS: "0",
            DYNAMICCODE: ""
        };

        db.users.update(
            { _id: mongo.helper.toObjectID(_id) },
            { $set: set },
            function (err, doc) {
                if (err) deferred.reject(err.name + ': ' + err.message);

                flag = {success: true};
                deferred.resolve(flag);
            });
    }

    return deferred.promise;
}

function updatePassword(_id, password){
    var deferred = Q.defer();

    // fields to update
    // add hashed password to user object

    var set = {
        hash: bcrypt.hashSync(password, 10)
    };

    db.users.update(
        { _id: mongo.helper.toObjectID(_id) },
        { $set: set },
        function (err, doc) {
            if (err) deferred.reject(err.name + ': ' + err.message);

            flag = {success: true};
            deferred.resolve(flag);
        });


    return deferred.promise;
}

function updateDynamicCode(_id, code) {
    var deferred = Q.defer();

    var set = {
        DYNAMICCODE: code
    };

    db.users.update(
        { _id: mongo.helper.toObjectID(_id) },
        { $set: set },
        function (err, doc) {
            if (err) deferred.reject(err.name + ': ' + err.message);

            deferred.resolve();
        });


    return deferred.promise;
}

function _delete(_id) {
    var deferred = Q.defer();

    db.users.remove(
        { _id: mongo.helper.toObjectID(_id) },
        function (err) {
            if (err) deferred.reject(err.name + ': ' + err.message);

            deferred.resolve();
        });

    return deferred.promise;
}