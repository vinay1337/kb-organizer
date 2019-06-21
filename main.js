const {
    app,
    BrowserWindow,
    shell,
    ipcMain
} = require('electron');
const fs = require('fs');
const csv = require('csv-parser');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win
let KBIDs = [];
let names = [];
let count = 0;
const path = '\\\\FS-LS-2\\IT Department\\KB PDF2HTML\\'

function createWindow() {
    // Create the browser window.
    let win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true
        },
        autoHideMenuBar: true,
        titleBarStyle: "hiddenInset"
    })

    // and load the index.html of the app.
    win.loadFile('index.html')

    // Emitted when the window is closed.
    win.on('closed', () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        win = null
    })

    //Read legend.csv
    fs.createReadStream(path + 'legend.csv')
        .pipe(csv(['KBID','docName']))
        .on('data', (row) => { //Called once per line in the CSV
            let fullname = row.docName;
            let extention = fullname.substring(fullname.length - 3, fullname.length);
            if(extention === 'pdf'){
                //separate file name from file extention
                let name = fullname.substring(0, fullname.length - 4);

                //Fill arrays
                KBIDs.push(row.KBID);
                names.push(name);
                count ++;
            }
        })
        .on('end', () => {
            console.log('CSV file successfully processed\n');
        });
}

//Organizing happens here when button is clicked
ipcMain.on('GO', (event, arg) => {
    for(i = 0; i < count; i++){
        console.log(KBIDs[i],names[i]);
    }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
})