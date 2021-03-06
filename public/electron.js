const {app, Menu, BrowserWindow, Tray, ipcMain, shell } = require('electron');
const path = require('path');
const spawn = require('child_process').spawn;
const exec = require('child_process').exec;


let tray = null;
let mainWindow = null;

let trayIconPath = path.join(
    app.getAppPath(),
    "../../public/cm_logo_outline.png"
);


function createWindow () {
    let mainWindow = new BrowserWindow({
	icon: trayIconPath,
	width: 600,
	height: 800,
	minWidth: 600,
	minHeight: 800,
	show: true,
	resizable: false,
	webPreferences: {
	    nodeIntegration: true
	}
    })

    mainWindow.setMenu(null);
    mainWindow.loadFile('build/index.html');

    if (process.env.PI_TOOL_DEBUG) {
	mainWindow.webContents.openDevTools();
    }

    mainWindow.on('close', (event) => {
	if (!app.isQuitting) {
	    event.preventDefault();
	    mainWindow.hide();
	}

	return false;
    });

    mainWindow.on('minimize', (event) => {
	event.preventDefault();
	mainWindow.hide();
    });

    mainWindow.on('closed', () => {
	mainWindow = null;
    });

    return mainWindow;
}

function launchApplication() {
    mainWindow = createWindow();
    
    const contextMenu = Menu.buildFromTemplate([
	{ label: 'Open', click: () => {
	    mainWindow.show();
	}},
	{ label: 'Separator', type: 'separator' },
	{ label: 'Quit', click: () => {
	    app.isQuitting = true;
	    app.quit();
	}}
    ]);
    tray = new Tray(trayIconPath);
    tray.setToolTip('Cooler Master Pi Tool');
    tray.setContextMenu(contextMenu);

    tray.on('click', () => {
	mainWindow.show();
    });
}

app.on('ready', () => {
    launchApplication();
});

/// IPC actions

ipcMain.on('open-browser', (event, url) => {
    console.log("Opening browser");
    shell.openExternal(url);
})

ipcMain.on('launch-script', (event, path) => {
    console.log("Launching script");
    spawn("lxterminal", ["-e", path], {detached: true});
})
