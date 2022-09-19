/* eslint-disable no-console */
const {
    default: installExtension,
    EMBER_INSPECTOR,
} = require('electron-devtools-installer');
const { pathToFileURL } = require('url');
const { app, ipcMain, BrowserWindow, webContents } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const handleFileUrls = require('./handle-file-urls');
const { LinWindow, LinWindowManager, LinWindowPlacementManager } = require('./linwindow');
const { ClassicPlacement } = require('./classic-placement');

const emberAppDir = path.resolve(__dirname, '..', 'ember-dist');
const emberAppURL = pathToFileURL(
    path.join(emberAppDir, 'index.html')
).toString();

// each package equals to window
// each window can have a lot of notifications

var lwm = new LinWindowManager();
var lwp = new ClassicPlacement(lwm);

var _ = require('underscore');

server = require(path.join(__dirname, './rest-api-server.js'));

server.get('/status', function (req, res) {
    res.end(JSON.stringify({
        status: 'ok',
    }));
});

server.post('/notify', function (req, res) {

    createWindow(req.body);

    res.end(JSON.stringify({
        status: 'ok',
    }));
});

// Uncomment the lines below to enable Electron's crash reporter
// For more information, see http://electron.atom.io/docs/api/crash-reporter/
// electron.crashReporter.start({
//     productName: 'YourName',
//     companyName: 'YourCompany',
//     submitURL: 'https://your-domain.com/url-to-submit',
//     autoSubmit: true
// });

app.on('window-all-closed', () => {
    // do not quit when no windows around
});

createWindow = (reqbody) => {

    let lw = lwm.findWindow(reqbody.package);

    let new_notification = _.defaults(
        {
            title: reqbody.title,
            text: reqbody.text,
            notify_id: reqbody.id,
            removal: reqbody.removal,
            package: reqbody.package,
            ...(!_.isUndefined(reqbody.big_text)) && { big_text: reqbody.big_text },
            ...(!_.isUndefined(reqbody.progress)) && { progress: reqbody.progress },
            ...(!_.isUndefined(reqbody.progress_indeterminate)) && { progress_indeterminate: reqbody.progress_indeterminate },
            ...(!_.isUndefined(reqbody.progress_max)) && { progress_max: reqbody.progress_max },
            ...(!_.isUndefined(reqbody.icon)) && { icon: reqbody.icon },
        },
        {
            big_text: "",
            progress: 0,
            progress_max: 0,
            progress_indeterminate: false,
            icon: "",
        });

    if (!_.isUndefined(lw)) {
        // send update to this window
        webContents.fromId(lw.id()).send('notification-data', new_notification);
        lw.push(new_notification);
        return;
    }

    if (new_notification.removal) // do not show new notification for removal
        return;

    let notifWindow = null;

    notifWindow = new BrowserWindow({
        width: 800,
        height: 600,
        frame: false,
        transparent: true,
        alwaysOnTop: true,
        useContentSize: true,
        focusable: false,
        show: false,
        webPreferences: {
            contextIsolation: true,
            preload: path.join(__dirname, './preload.js'),
        }
    });

    // notifWindow.openDevTools({mode: 'undocked'});

    // Load the ember application
    notifWindow.loadURL(emberAppURL);

    // If a loading operation goes wrong, we'll send Electron back to
    // Ember App entry point
    notifWindow.webContents.on('did-fail-load', () => {
        notifWindow.loadURL(emberAppURL);
    });

    notifWindow.webContents.on('render-process-gone', (_event, details) => {
        if (details.reason === 'killed' || details.reason === 'clean-exit') {
            return;
        }
        console.log(
            'Your main window process has exited unexpectedly -- see https://www.electronjs.org/docs/api/web-contents#event-render-process-gone'
        );
        console.log('Reason: ' + details.reason);
    });

    notifWindow.on('unresponsive', () => {
        console.log(
            'Your Ember app (or other code) has made the window unresponsive.'
        );
    });

    notifWindow.on('responsive', () => {
        console.log('The main window has become responsive again.');
    });

    notifWindow.on('close', (event) => {
        lwm.remove(event.sender.webContents.id);
    });

    lw = new LinWindow(notifWindow.webContents.id, new_notification.package);
    lw.push(new_notification);
    lwm.push(lw);
};

app.on('ready', async () => {
    if (isDev) {
        try {
            await installExtension(EMBER_INSPECTOR, {
                loadExtensionOptions: { allowFileAccess: true },
            });
        } catch (err) {
            console.log('Failed to install Ember Inspector: ', err);
        }
    }

    await handleFileUrls(emberAppDir);

});

ipcMain.handle('ready', async (event, data) => {
    let lw = lwm.findWindowById(event.sender.id);
    if (!_.isUndefined(lw)) {
        lw.notifications.forEach((n) => {
            webContents.fromId(event.sender.id).send('notification-data', n);
        });
    }
});

ipcMain.handle('control', async (event, data) => {
    if (data.action == 'close') {
        BrowserWindow.fromWebContents(webContents.fromId(event.sender.id)).close();
    } else if (data.action == "resize") {
        data.width += 20;
        data.height += 20;
        BrowserWindow.fromWebContents(webContents.fromId(event.sender.id)).setContentSize(data.width, data.height);
        let lw = lwm.findWindowById(event.sender.id);
        if (!_.isUndefined(lw)) {
            lw.width = data.width;
            lw.height = data.height;
            lwm.place();
        }
    }
});

// Handle an unhandled error in the main thread
//
// Note that 'uncaughtException' is a crude mechanism for exception handling intended to
// be used only as a last resort. The event should not be used as an equivalent to
// "On Error Resume Next". Unhandled exceptions inherently mean that an application is in
// an undefined state. Attempting to resume application code without properly recovering
// from the exception can cause additional unforeseen and unpredictable issues.
//
// Attempting to resume normally after an uncaught exception can be similar to pulling out
// of the power cord when upgrading a computer -- nine out of ten times nothing happens -
// but the 10th time, the system becomes corrupted.
//
// The correct use of 'uncaughtException' is to perform synchronous cleanup of allocated
// resources (e.g. file descriptors, handles, etc) before shutting down the process. It is
// not safe to resume normal operation after 'uncaughtException'.
process.on('uncaughtException', (err) => {
    console.log('An exception in the main thread was not handled.');
    console.log(
        'This is a serious issue that needs to be handled and/or debugged.'
    );
    console.log(`Exception: ${err}`);
});
