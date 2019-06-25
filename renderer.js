// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const {
    ipcRenderer
} = require('electron')

document.getElementById('btn').addEventListener('click', function () {
    // var btn = document.getElementById('btn');
    // btn.parentNode.removeChild(btn);
    document.getElementById('btn').style.display = 'none';
    document.getElementById('gif').style.display = 'block';
    document.getElementById('loadtext').innerHTML = 'organizing KBs...'
    ipcRenderer.send('GO', 1337);
});

document.getElementById('close').addEventListener('click', function () {
    ipcRenderer.send('CLOSE', 1337);
});

ipcRenderer.on('STOP', (event, arg) => {
    document.getElementById('loadtext').innerHTML = 'cleaning up HTML...'
});

ipcRenderer.on('FINISHED', (event, arg) => {
    document.getElementById('loadtext').innerHTML = 'done!'
    document.getElementById('gif').style.display = 'none';
    document.getElementById('close').style.display = 'block';
});