const express = require('express');

class MainPage {
    constructor(_server) {
        const router = express.Router();

        router.get('/', (_req, res)=>{
            res.sendFile(__dirname+'/public/index.html');
        });
        router.get('/index.js', (_req, res)=>{
            res.sendFile(__dirname+'/public/index.js');
        });
        router.get('/style.css', (_req, res)=>{
            res.sendFile(__dirname+'/public/style.css');
        });
        router.get('/favicon.png', (_req, res) => {
            res.sendFile(__dirname + '/public/favicon.png');
        });

        return router;
    }
}


module.exports=MainPage;