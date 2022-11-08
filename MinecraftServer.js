const cp = require('child_process');
const https = require('https');
const fs = require('fs');

const types = { PAPER: 'papermc', VANILLA: 'vanilla' }
const state = { READY: 'ready', STARTING: 'starting', STOPPING: 'stopping', SETUP: 'setup', ERROR: 'error', EULA: 'eula', NOTSTARTED: 'notstarted' };

class Server {
    constructor() {
        this.type = null;
        this.status = state.NOTSTARTED
        this.process = null;
        this.onChangeStatus = null;
        this.onMessage = null;
    }
    _changeState(changedStatus) {
        this.status = changedStatus
        if (this.onChangeStatus !== null) {
            this.onChangeStatus(changedStatus);
        }
    }
    _getDataFromURL(url) {
        return new Promise((resolve, reject) => {
            let data = '';
            https.get(url, (res) => {
                res.on('data', (chunk) => { data = data + chunk.toString(); });
                res.on('end', () => { resolve(data) });
                res.on('error', err => reject(err));
            });
        });
    }
    _download(url, path) {
        const req = https.request(url, (res) => {
            const ws = fs.createWriteStream(path);
            res.pipe(ws);
            res.on('close', () => {
                ws.on('finish', () => {
                    ws.close();
                });
            });
        });
        req.end()
    }
    setEula(bool) {
        let text = fs.readFileSync(__dirname + '/minecraft/eula.txt', 'utf8');
        let textLines = text.split('\n')
        text = '';
        textLines.forEach((line) => {
            if (line.split('=')[0] === 'eula') {
                text += 'eula=' + String(bool) + '\n';
            } else {
                text += line
            }
        });
        fs.writeFileSync(__dirname + '/minecraft/eula.txt', text);

    }
    on() {
        if (this.process !== null) { return; }
        this.process = cp.spawn('java', ['-jar', __dirname + '/minecraft/server.jar', 'nogui'], { cwd: __dirname + '/minecraft/' });
        this.process.stdin.setEncoding('utf8');
        this._changeState(state.STARTING)
        this.process.stdout.on('data', (chunk) => {
            if (chunk.toString().toLowerCase().includes('eula')) { this._changeState(state.EULA) }
            if (chunk.toString().toLowerCase().includes('done')) { this._changeState(state.READY) }
        });
        this.process.stderr.on('data', (err) => { console.error('Error occured at MCServer: ' + err); this._changeState(state.ERROR) });
        this.process.on('close', (code, signal) => { if (!this.status === state.EULA) { this._changeState(state.NOTSTARTED); } });
        if (this.onMessage !== null) {
            this.process.stdout.on('data', this.onMessage);
        }
    }
    off() {
        if (this.process === null) { return; }
        this.process.kill(0);
        this.process = null;
        this._changeState(state.STOPPING)
    }
    reset() {
        if (this.process !== null) { return; }
        fs.rmdirSync(__dirname + '/minecraft');
    }
    sendCommand(cmd) {
        if (this.process === null) { return; }
        this.process.stdin.write(cmd + '\r');
    }
    setOnMessage(exec) {
        if (this.process === null) {
            this.onMessage = exec;
        } else {
            this.process.stdout.on('data', exec);
        }
    }
    setOnChangeState(exec) {
        this.onChangeStatus = exec;
    }
    setSetting(key, val) {
        let text = fs.readFileSync(__dirname + '/minecraft/server.properties', 'utf8');
        let textLines = text.split('\n')
        text = '';
        textLines.forEach((line) => {
            if (line.split('=')[0] === key) {
                text += key + '=' + String(val) + '\n';
            } else {
                text += line
            }
        });
        fs.writeFileSync(__dirname + '/minecraft/server.properties', text);
    }
    setup(type, version) {
        if (!fs.existsSync('./minecraft')) {
            fs.mkdirSync('./minecraft')
        }
        this._changeState(state.SETUP);
        if (type === types.PAPER) {
            this.type = types.PAPER;
            this._getDataFromURL(`https://api.papermc.io/v2/projects/paper/versions/${version}/builds`).then((buildsList) => {
                const latestBuild = JSON.parse(buildsList)['builds'].splice(-1)[0];
                const buildNumber = latestBuild.build;
                const buildFileName = latestBuild.downloads.application.name;
                this._download(`https://api.papermc.io/v2/projects/paper/versions/${version}/builds/${buildNumber}/downloads/${buildFileName}`, __dirname + '/minecraft/server.jar');
                this._changeState(state.NOTSTARTED);
            }, err => { console.error('Error while loading Paper builds: ' + err); this._changeState(state.ERROR); });
        } else if (type === types.VANILLA) {
            this.type = types.VANILLA;
            this._getDataFromURL('https://piston-meta.mojang.com/mc/game/version_manifest_v2.json').then((manifest) => {
                JSON.parse(manifest).versions.forEach((mcversion, index) => {
                    if (mcversion.id === version) {
                        this._getDataFromURL(mcversion.url).then((versionManifest) => {
                            this._download(JSON.parse(versionManifest).downloads.server.url, __dirname + '/minecraft/server.jar');
                            this._changeState(state.NOTSTARTED);
                        }, err => { console.error(`Error while loading ${version} manifest: ` + err); this._changeState(state.ERROR); });
                        return;
                    }
                });

            }, err => console.error('Error while loading Minecraft manifest: ' + err));
        }

    }
}

module.exports = Server;