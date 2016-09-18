var express = require('express');
var router = express.Router();
var request = require('request');
var config = require('config.json');

router.post('/add', function (req, res) {
    // authenticate using api to maintain clean separation between layers
    request.post({
        url: config.apiUrl + '/groups/add',
        form: req.body,
        json: true
    }, function (error, response, body) {

        if (error) {
            res.status(401).json({'message':'An error occurred' , 'successful' : 'false', 'info' : ''});
        }else if( response.statusCode == 200 && body.group) {
            res.status(200).json({'message':'Your group was created successful' , 'successful' : 'true', 'info' : body.group});
        }else if(response.statusCode == 401){
            res.status(401).json({'message':'Please login before create group' , 'successful' : 'false', 'info' : ''});
        } else{
            res.status(400).json({'message':"Sorry, we can't create your group right now" , 'successful' : 'false', 'info' : ''});
        }
    });
});

router.put('/update', function (req, res) {
    // register using api to maintain clean separation between layers
    request.put({
        url: config.apiUrl + '/groups/update',
        form: req.body,
        json: true
    }, function (error, response, body) {
        if (error) {
            return res.status(401).json({'message':'An error occurred' , 'successful' : 'false', 'info' : ''});
        }

        if (response.statusCode == 200) {
            return res.status(401).json({'message':'Your group was updated successful' , 'successful' : 'true', 'info' : ''});
        }else if(response.statusCode == 401) {
            res.status(401).json({'message':'Please login before create group' , 'successful' : 'false', 'info' : ''});
        }else if(response.statusCode == 500) {
            res.status(500).json({'message':'Not your group or group not found' , 'successful' : 'false', 'info' : ''});
        }else{
            // return failure message
            res.status(503).json({'message':"Sorry, we can't update your group right now " , 'successful' : 'false', 'info' : ''});
        }

    });
});

router.delete('/delete', function (req, res) {
    // register using api to maintain clean separation between layers
    request.delete({
        url: config.apiUrl + '/groups/delete',
        form: req.body,
        json: true
    }, function (error, response, body) {
        if (error) {
            return res.status(401).json({'message':'An error occurred' , 'successful' : 'false', 'info' : ''});
        }

        if (response.statusCode == 200) {
            return res.status(200).json({'message':'Your group was deleted successful' , 'successful' : 'true', 'info' : ''});
        }else if(response.statusCode == 401){
            res.status(401).json({'message':'Please login before create group' , 'successful' : 'false', 'info' : ''});
        }else if(response.statusCode == 500){
            res.status(500).json({'message':'Not your group or group not found' , 'successful' : 'false', 'info' : ''});
        }
        else{
            // return success message
            res.status(401).json({'message':"Sorry, we can't delete your group right now " , 'successful' : 'false', 'info' : ''});
        }
    });
});

router.post('/get', function (req, res) {
    // register using api to maintain clean separation between layers
    request.post({
        url: config.apiUrl + '/groups/get',
        form: req.body,
        json: true
    }, function (error, response, body) {
        if (error) {
            return res.status(401).json({'message':'An error occurred' , 'successful' : 'false', 'info' : ''});
        }

        if (response.statusCode == 200) {
            return res.status(200).json({'message':'Get your list groups successful' , 'successful' : 'true', 'info' : body.groups});
        }else if(response.statusCode == 401){
            res.status(401).json({'message':'Please login before create group' , 'successful' : 'false', 'info' : ''});
        }else if(response.statusCode == 500){
            res.status(500).json({'message':"You don't own any group" , 'successful' : 'false', 'info' : ''});
        }
        else{
            // return success message
            res.status(401).json({'message':"Sorry, no group were found " , 'successful' : 'false', 'info' : ''});
        }
    });
});


module.exports = router;