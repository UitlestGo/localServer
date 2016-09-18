var config = require('config.json');
var express = require('express');
var router = express.Router();

var userService = require('services/user.service');
var tokenService = require('services/token.service');
var sendmailLogic = require('logic/sendmail.logic');

var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');

// routes
router.post('/authenticate', authenticateUser);
router.post('/register', registerUser);
router.post('/requestChangePassword' , requestChangePassword);
router.post('/validateDynamicCode' , validateDynamicCode);
router.put('/newPassword' , newPassword);
router.put('/updatePassword' , updatePassword);
router.get('/current', getCurrentUser);
router.put('/update', updateUser);
router.delete('/:_id', deleteUser);

module.exports = router;

function authenticateUser(req, res) {
    userService.authenticate(req.body.username, req.body.password)
        .then(function (user) {
            if (user) {
                // authentication successful
                var token = jwt.sign({ sub: user._id }, config.secret);
                createToken(user._id.toString(), token);

                var msg = {'message':token, 'successful': 'true', 'info': user};

                res.send({ message: msg });
            }else {
                res.sendStatus(401);
            }
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function registerUser(req, res) {
    userService.create(req.body)
        .then(function () {
            res.sendStatus(200);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function getCurrentUser(req, res) {
    userService.getById(req.user.sub)
        .then(function (user) {
            if (user) {
                res.send(user);
            } else {
                res.sendStatus(404);
            }
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function updateUser(req, res) {
    var author = req.body.id;
    var token = req.body.token;

    // check token and userId match with database
    tokenService.checkToken(author, token)
        .then(function (subMsg) {
            if(subMsg && subMsg.success == true){
                console.log("validate user authenticate success");

                userService.update(author, req.body)
                    .then(function () {
                        res.sendStatus(200);
                    })
                    .catch(function (err) {
                        res.sendStatus(401)
                    });
            }else{
                res.sendStatus(401)
            }

        }).catch(function (subErr) {
        res.sendStatus(401)
    });
}

function requestChangePassword(req, res){
    var userId = req.body.id;
    console.log("request change password, userid = " + userId);

    userService.getById(userId)
        .then(function (user) {
            if (user) {
                sendMail(user.EMAIL, user._id, req, res);
            } else {
                res.sendStatus(404);
            }
        })
        .catch(function (err) {
            res.sendStatus(404);
        });
}

function validateDynamicCode(req, res){
    var userId = req.body.id;
    var code = req.body.code;
    console.log("validate code change password, userid = " + userId + " - code: " + code);

    userService.validateDynamicCode(userId , code)
        .then(function (msg) {
            console.log(msg);
            if (msg && msg.success == true) {
                res.sendStatus(200);
            } else {
                res.sendStatus(404);
            }
        })
        .catch(function (err) {
            res.sendStatus(404);
        });
}

function newPassword(req, res){
    var userId = req.body.id;
    var password = req.body.password;
    console.log("change password, userid = " + userId);

    userService.newPassword(userId , password)
        .then(function (msg) {
            console.log(msg);
            if (msg && msg.success == true) {
                res.sendStatus(200);
            } else {
                res.sendStatus(404);
            }
        })
        .catch(function (err) {
            res.sendStatus(404);
        });
}

function updatePassword(req, res){
    var userId = req.body.id;
    var password = req.body.password;
    var newpassword = req.body.newpassword;

    userService.getById(userId).then(function (user) {
            if (user && bcrypt.compareSync(password, user.hash)) {
                userService.updatePassword(userId, newpassword)
                    .then(function (msg) {
                        console.log(msg);
                        if (msg && msg.success == true) {
                            res.sendStatus(200);
                        } else {
                            res.sendStatus(404);
                        }
                    })
                    .catch(function (err) {
                        res.sendStatus(404);
                    });
            } else {
                res.sendStatus(401);
            }
        })
        .catch(function (err) {
            res.sendStatus(500);
        });

    console.log("change password, userid = " + userId);
}

function deleteUser(req, res) {
    var userId = req.user.sub;
    if (req.params._id !== userId) {
        // can only delete own account
        return res.status(401).send('You can only delete your own account');
    }

    userService.delete(userId)
        .then(function () {
            res.sendStatus(200);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function createToken(author, token){
    tokenService.create(author, token)
        .then(function (subMsg) {
        }).catch(function (subErr) {

    });
}

function sendMail(reciever, userId, req, res){
    var code = Math.floor(1000 + Math.random() * 9000);
    var text = "Your code to change password is : " + code;
    console.log("User change password with code: " + code);

    sendmailLogic.sendmail(reciever, text)
        .then(function (success) {
            if (success) {
                updateDynamicCode(userId, code);
                res.sendStatus(200);
            }else {
                res.sendStatus(500);
            }
        })
        .catch(function (err) {
            res.sendStatus(500);
        });
}

function updateDynamicCode(userId, code){
    userService.updateDynamicCode(userId, code)
        .then(function (user) {

        })
        .catch(function (err) {
        });
}