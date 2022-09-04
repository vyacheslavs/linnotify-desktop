"use strict";

const { LinWindowPlacementManager } = require('./linwindow');
const { screen } = require('electron')
const { BrowserWindow, webContents } = require('electron');
var _ = require('underscore');

class ClassicPlacement extends LinWindowPlacementManager {
    place() {
        const primaryDisplay = screen.getPrimaryDisplay();
        const { width, height } = primaryDisplay.workAreaSize;

        let y = height;
        let x = width;

        this.lwm.windows.forEach((win) => {
            if (win.width>0 && win.height>0) {
                let w = BrowserWindow.fromWebContents(webContents.fromId(win.webContentsId));
                if (!_.isUndefined(w)) {
                    y -= win.height;
                    x = width - win.width;
                    w.setPosition(x, y);
                }
            }
        });

    }
}

module.exports.ClassicPlacement = ClassicPlacement;
