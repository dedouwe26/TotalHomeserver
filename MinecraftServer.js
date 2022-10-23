const { spawn } = require('child_process')

class server {
    static {
        this.process=null;
        this.onMessage=()=>{};
    }
    static toggle() {
        if (process!==null) {
            // create
        } else {
            // stop
        }
    }
    static sendCommand(cmd) {

    }
    static setOnMessage(exec) {
        this.onMessage=exec;
    }
    static setup(version, type) {
        
    }
}

module.exports = server