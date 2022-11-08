const express = require('express');
const socketio = require('socket.io');
const fs = require('fs');
const uuid = require('uuid');

const MinecraftServer = require('./MinecraftServer')

class AdminPanel {
    constructor(server, logins) {
        this.mcserver=null;
        this.loggedIns = {}

        const app = express();

        app.disable('x-powered-by');
        app.use('/icons',express.static(__dirname+'/public/adminpanel/icons'))

        const io = new socketio.Server(server);

        app.get('/', (req, res) => {
            res.setHeader('Content-Type', 'text/html');
            if (req.query.username) {
                if (Object.keys(logins).includes(req.query.username)) {
                    if (logins[req.query.username] === req.query.password) {
                        for (const key in this.loggedIns) {
                            const val = this.loggedIns[key];
                            if (val === req.query.username) {
                                delete this.loggedIns[key];
                            }
                        }
                        const newID = uuid.v4();
                        this.loggedIns[newID] = req.query.username;
                        const fileText = fs.readFileSync(__dirname + '/public/adminpanel/index.html', 'utf8').replace('%%UUID%%', newID);
                        res.send(fileText);
                    } else {
                        res.send('<h2>Wrong password</h2>\n<a href="/adminpanel">Go back</a>');
                    }
                } else {
                    res.send('<h2>No user called ' + req.query.username + '</h2>\n<a href="/adminpanel">Go back</a>');
                }
            } else {
                res.sendFile(__dirname + '/public/adminpanel/login.html');
            }

        });
        app.get('/login.css', (_req, res) => {
            res.sendFile(__dirname + '/public/adminpanel/login.css');
        });
        app.get('/style.css', (_req, res) => {
            res.sendFile(__dirname + '/public/adminpanel/style.css');
        });
        app.get('/login.js', (_req, res) => {
            res.setHeader('Content-Type', 'application/javascript');
            res.sendFile(__dirname + '/public/adminpanel/login.js');
        });
        app.get('/index.js', (_req, res) => {
            res.setHeader('Content-Type', 'application/javascript');
            res.sendFile(__dirname + '/public/adminpanel/index.js');
        });

        this.setupSocket(io);

        return app;
    }
    _checkUUID(data) {
        if (uuid.validate(data.auth)) {
            return data.auth in this.loggedIns;
        }
        return false;
    }
    setupSocket(io) {
        io.on('connection', socket => {
            // data.event
            socket.on('mc', (data)=>{
                if (!this._checkUUID(data)) {return;}
                switch (data.event) {
                    case 'init':
                        if (this.mcserver!==null) {return;}
                        this.mcserver = new MinecraftServer();
                        this.mcserver.setOnChangeState((state)=>{if (socket) {socket.emit('state', state)}});
                        this.mcserver.setOnMessage((msg)=>{if (socket) {socket.emit('msg', msg)}});
                        break;
                    case 'turn':
                        if (data.turn==='on') {
                            this.mcserver.on();
                        } else {
                            this.mcserver.off();
                        }
                        break;
                    case 'getOnOff':
                        return this.mcserver.process!==null;
                    case 'setup':
                        this.mcserver.reset();
                        this.mcserver.setup(data.type, data.version);
                        break;
                    case 'command':
                        this.mcserver.sendCommand(data.cmd);
                        break;
                    case 'eula':
                        this.mcserver.setEula(data.eula);
                        break;
                    case 'setting':
                        this.mcserver.setEula(data.setting, data.value);
                        break;
                    case 'reset':
                        this.mcserver.reset();
                        break;
                    default:
                        break;
                }
            });
            socket.on('services', (data)=>{
                if (!this._checkUUID(data)) {return;}
            });
            socket.on('status',(data)=>{
                if (!this._checkUUID(data)) {return;}
            });
            socket.on('customers', (data)=>{
                if (!this._checkUUID(data)) {return;}
            });
            socket.on('more', (data)=>{
                if (!this._checkUUID(data)) {return;}
            });

        });
    }
}

module.exports = AdminPanel;