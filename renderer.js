// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const {
    ipcRenderer
} = require('electron')

document.getElementById('btn').addEventListener('click', function () {
    var btn = document.getElementById('btn');
    btn.parentNode.removeChild(btn);
    //document.getElementById('btn').style.display = 'none';
    document.getElementById('gif').style.display = 'block';
    document.getElementById('loadtext').innerHTML = 'working...'
    ipcRenderer.send('GO', 9001);
});