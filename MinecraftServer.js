import { spawn } from 'child_process';

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

/* 
    TEMPORARY:
#   paper api:
    https://api.papermc.io/v2/projects/paper/versions/${version}/builds
    in 'builds' get the latest (last) build: get in there the build
    filename: also in there: downloads.application.name
    download url: https://api.papermc.io/v2/projects/paper/versions/${version}/builds/${build}/downloads/${filename}
#   vanilla api:
    minecraft manifest

*/

export default server