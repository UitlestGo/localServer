var express = require('express');
var router = express.Router();
var request = require('request');
var config = require('config.json');
var nodemailer = require('nodemailer');

var sendmailLogic = require('logic/sendmail.logic');



router.put('/update', function (req, res) {
    // authenticate using api to maintain clean separation between layers
    request.put({
        url: config.apiUrl + '/users/update',
        form: req.body,
        json: true
    }, function (error, response, body) {
        if (error) {
            res.status(401).json({'message':'An error occurred' , 'successful' : 'false', 'info' : ''});
        }

        if(response.statusCode != 401){
            res.status(200).json({'message':"Update user profile successful", 'successful': 'true', 'info': ""});
        }else{
            res.status(401).json({'message':'Validate account failure' , 'successful' : 'false', 'info' : ''});
        }

    });
});

router.get('/delete', function (req, res) {
    var text = "Your code to change password is : 2568";
    sendmailLogic.sendmail("anhkhanguit@gmail.com", text)
        .then(function (success) {
            if (success) {
                res.status(200).json({'message':'Send mail successful' , 'successful' : 'true', 'info' : ''});
            }else {
                res.status(200).json({'message':'Send mail failure' , 'successful' : 'false', 'info' : ''});
            }


        })
        .catch(function (err) {
            res.status(200).json({'message':'Send mail failure' , 'successful' : 'false', 'info' : ''});
        });
});

router.post('/requestChangePassword', function (req, res) {
    // authenticate using api to maintain clean separation between layers
    request.post({
        url: config.apiUrl + '/users/requestChangePassword',
        form: req.body,
        json: true
    }, function (error, response, body) {
        if (error) {
            res.status(404).json({'message':'An error occurred' , 'successful' : 'false', 'info' : ''});
        }

        if(response.statusCode == 200){
            res.status(200).json({'message':"Check your code in email", 'successful': 'true', 'info': ''});
        }else if(response.statusCode == 500){
            res.status(500).json({'message':"Please update your email", 'successful': 'false', 'info': ''});
        }else{
            res.status(401).json({'message':'Validate account failure' , 'successful' : 'false', 'info' : ''});
        }

    });
});

router.post('/validateDynamicCode', function (req, res) {
    // authenticate using api to maintain clean separation between layers
    request.post({
        url: config.apiUrl + '/users/validateDynamicCode',
        form: req.body,
        json: true
    }, function (error, response, body) {
        if (error) {
            res.status(404).json({'message':'An error occurred' , 'successful' : 'false', 'info' : ''});
        }

        if(response.statusCode == 200){
            res.status(200).json({'message':"Ok, now you can change your password", 'successful': 'true', 'info': ''});
        }else if(response.statusCode == 404){
            res.status(500).json({'message':"Sorry, your code not match", 'successful': 'false', 'info': ''});
        }else{
            res.status(401).json({'message':'Validate account failure' , 'successful' : 'false', 'info' : ''});
        }

    });
});

router.put('/newPassword', function (req, res) {
    // authenticate using api to maintain clean separation between layers
    request.put({
        url: config.apiUrl + '/users/newPassword',
        form: req.body,
        json: true
    }, function (error, response, body) {
        if (error) {
            res.status(404).json({'message':'An error occurred' , 'successful' : 'false', 'info' : ''});
        }

        if(response.statusCode == 200){
            res.status(200).json({'message':"Ok, your password was changed", 'successful': 'true', 'info': ''});
        }else if(response.statusCode == 404){
            res.status(500).json({'message':"Sorry, we can't update your password now", 'successful': 'false', 'info': ''});
        }else{
            res.status(401).json({'message':'Validate account failure' , 'successful' : 'false', 'info' : ''});
        }

    });
});

router.put('/updatePassword', function (req, res) {
    // authenticate using api to maintain clean separation between layers
    var newpassword = req.body.newpassword;
    var repassword = req.body.repassword;

    if(newpassword == repassword) {

        request.put({
            url: config.apiUrl + '/users/updatePassword',
            form: req.body,
            json: true
        }, function (error, response, body) {
            if (error) {
                res.status(404).json({'message': 'An error occurred', 'successful': 'false', 'info': ''});
            }

            if (response.statusCode == 200) {
                res.status(200).json({'message': "Ok, your password was changed", 'successful': 'true', 'info': ''});
            }else if (response.statusCode == 404) {
                res.status(404).json({
                    'message': "Sorry, we can't update your password now",
                    'successful': 'false',
                    'info': ''
                });
            }else if(response.statusCode == 401){
                res.status(401).json({'message': 'Please login before update password', 'successful': 'false', 'info': ''});
            }else{
                res.status(500).json({'message': 'User not found', 'successful': 'false', 'info': ''});
            }

        });
    }else{
        res.status(401).json({'message': 'new password and repassword not match', 'successful': 'false', 'info': ''});
    }
});

module.exports = router;