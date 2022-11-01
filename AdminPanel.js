const express = require('express');
const socketio = require('socket.io');
const fs = require('fs');
const uuid = require('uuid');

class AdminPanel {
    constructor(server, logins) {
        this.loggedIns = {}

        const app = express();

        const io = new socketio.Server(server);

        app.get('/', (req, res) => {
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
        app.get('/style.css', (req, res) => {
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

        io.on('connection', socket => {

        });

        return app;
    }
}

module.exports = AdminPanel;