const {
    app,
    BrowserWindow,
    shell,
    ipcMain
} = require('electron');
const fs = require('fs-extra');
const csv = require('csv-parser');
const spawn = require('child_process').spawn;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win
let KBIDs = [];
let names = [];
let count = 0;
const path = '\\\\FS-LS-2\\IT Department\\KB PDF2HTML\\';
const scriptPath = path + 'Scripts\\HTML-beauti.py\\HTML-Beauti.py';
let organized = false;
let python

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
    fs.createReadStream(path + 'Data\\legend.csv')
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
            console.log('CSV file parsed successfully\n');
        });
}

ipcMain.on('CLOSE', (event, arg) => {
    shell.openItem(path + 'Organized\\');
    app.quit();
});

//Organizing happens here when button is clicked
ipcMain.on('GO', (event, arg) => {
    for(i = 0; i < count; i++){

        //Move html file
        oldHTML = path + 'HTMLs\\' + names[i] + '.html'; //  \\FS-LS-2\IT Department\KB PDF2HTML\HTMLs\[kbarticlename].html
        newHTML = path + 'Organized\\' + KBIDs[i] + '\\' + names[i] + '.html' // \\FS-LS-2\IT Department\KB PDF2HTML\Organized\[KBID]\[kbariclename].html
        console.log('moving file from', oldHTML);
        console.log('to', newHTML);

        fs.mkdirpSync(path + 'Organized\\' + KBIDs[i]);
        fs.copySync(oldHTML, newHTML);


        //Move images folder 
        oldDir = path + 'HTMLs\\' + names[i];
        newDir = path + 'Organized\\' + KBIDs[i] + '\\' + names[i]
        console.log('moving folder from', oldDir);
        console.log('to', newDir);
        
        fs.copySync(oldDir, newDir);

    }
    //Tell renderer that organization is complete
    event.reply('STOP', 1337);
    organized = true;
    beautipy(event);
});

function beautipy(event){

    let pyargs = [scriptPath];
    KBIDs.forEach(function(id){
        pyargs.push(id.toString());
        console.log(id);
    });

    //console.log(pyargs);

    console.log('Running HTML-beauti.py...');
    python = spawn('python', pyargs);

    python.stdout.on('data', (data) => {
        console.log(`${data}`);
    });

    python.on('exit', (code) => {
        console.log('HTML-beauti.py completed');
        console.log('exiting...');
        //app.quit();
        event.reply('FINISHED', 1337);
    });
}


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