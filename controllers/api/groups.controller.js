var config = require('config.json');
var express = require('express');
var router = express.Router();

var groupService = require('services/group.service');
var tokenService = require('services/token.service');

// routes
router.post('/add', createGroup);
router.delete('/delete', deleteGroup);
router.put('/update', updateGroup);
router.post('/get', getList);

module.exports = router;

function createGroup(req, res) {

    var author = req.body.author;
    var token = req.body.token;

    tokenService.checkToken(author, token)
        .then(function (subMsg) {
            if(subMsg && subMsg.success == true){
                console.log("validate user authenticate success, userId =" + author);
                newGroup();
            }else{
                res.sendStatus(401);
            }

        }).catch(function (subErr) {
        res.sendStatus(401);
    });

    function newGroup(){
        groupService.create(req.body)
            .then(function (group) {
                res.status(200).send(group);
            })
            .catch(function (err) {
                res.status(400).send(err);
            });
    }
}

function deleteGroup(req, res) {
    var groupId = req.body.id;

    var author = req.body.author;
    var token = req.body.token;

    tokenService.checkToken(author, token)
        .then(function (subMsg) {
            if(subMsg && subMsg.success == true){
                console.log("validate user authenticate success, userId =" + author);
                groupRemove()
            }else{
                res.sendStatus(401);
            }

        }).catch(function (subErr) {
        res.sendStatus(401);
    });

    function groupRemove(){
        groupService.delete(groupId, author)
            .then(function (msg) {
                if(msg && msg.success == true){
                    res.sendStatus(200);
                }else{
                    res.sendStatus(500);
                }

            })
            .catch(function (err) {
                res.status(500).send(err);
            });
    }

}

function updateGroup(req, res){

    var author = req.body.author;
    var token = req.body.token;
    var groupId = req.body.id;
    tokenService.checkToken(author, token)
        .then(function (subMsg) {
            if(subMsg && subMsg.success == true){
                console.log("validate user authenticate success, userId =" + author);
                groupUpdate();
            }else{
                res.sendStatus(401);
            }

        }).catch(function (subErr) {
        res.sendStatus(401);
    });

    function groupUpdate(){
        groupService.update(groupId, req.body)
            .then(function (msg) {

                if(msg && msg.success == true){
                    res.sendStatus(200);
                }else{
                    res.sendStatus(500);
                }

            })
            .catch(function (err) {
                res.sendStatus(503);
            });
    }
}

function getList(req, res){

    var author = req.body.author;
    var token = req.body.token;
    tokenService.checkToken(author, token)
        .then(function (subMsg) {
            if(subMsg && subMsg.success == true){
                console.log("validate user authenticate success, userId =" + author);
                getListGroups();
            }else{
                res.sendStatus(401);
            }

        }).catch(function (subErr) {
        res.sendStatus(401);
    });

    function getListGroups(){
        groupService.get(author)
            .then(function (groups) {

                if(groups){
                    res.status(200).send({groups: groups});
                }else{
                    res.sendStatus(500);
                }

            })
            .catch(function (err) {
                res.sendStatus(503);
            });
    }
}