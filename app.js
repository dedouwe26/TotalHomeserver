const express = require('express');
const yaml = require('js-yaml');
const fs = require('fs');
const http = require('http');

const AdminPanel = require('./AdminPanel');
const MainPage = require('./MainPage');

function main() {
    let data = yaml.load(fs.readFileSync('config.yml'))

    if (!data.wan==='0.0.0.0') {
        const wanIP=data.wan
        const wan = express()
        const wanServer = http.createServer(wan)
        wan.disable('x-powered-by')
        wan.use('/', new MainPage(wanServer))
        // lan.use('/', new Services(wanServer))
        wanServer.listen(80, wanIP, ()=>{
            console.log(`WAN running on ${wanIP} and port 80`);
        })
    }

    const lanIP=data.lan

    const lan = express()
    const lanServer = http.createServer(lan)

    lan.disable('x-powered-by')
    lan.use('/', new MainPage(lanServer))
    lan.use('/adminpanel', new AdminPanel(lanServer, data.accounts))
    // lan.use('/', new Services(lanServer))

    lanServer.listen(80, lanIP, ()=>{
        console.log(`LAN running on ${lanIP} and port 80`);
    });

    console.log(`Use ${lanIP}/adminpanel to change stuff on the server.`);
}
main();