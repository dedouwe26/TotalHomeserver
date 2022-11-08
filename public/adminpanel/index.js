if (localUUID) {
    if (localUUID==='') {
        window.close();
    }
} else {
    window.close();
}
let previousOpen;
const socket = io();
function openPage(page) {
    if (page===2) {
        socket.emit('mc', {event: 'init'})
    }
    if (previousOpen) {
        previousOpen.style.display='';
    }
    previousOpen=document.getElementById('page'+page)
    previousOpen.style.display='block';
}