"use strict";

var _ = require('underscore');

class LinWindow {
    constructor(id, pkgName) {
        this.notifications = [];
        this.webContentsId = id;
        this.packageName = pkgName;
    }

    push(notification) {
        // check if notification already exists (will be searching by key)
        let old_notification = _.findWhere(this.notifications, {
            notify_id: notification.notify_id
        });
        if (!_.isUndefined(old_notification))
            this.notifications = _.without(this.notifications, old_notification);
        this.notifications.push(notification);
    }

    id() {
        return this.webContentsId;
    }
};

class LinWindowManager {
    constructor() {
        this.windows = [];
    }

    push(lw) {
        this.windows.push(lw);
    }

    findWindow(pkgName) {
        return _.findWhere(this.windows, {
            packageName: pkgName
        });
    }

    findWindowById(id) {
        return _.findWhere(this.windows, {
            webContentsId: id
        });
    }

    remove(webId) {
        let lw = _.findWhere(this.windows, {
            webContentsId: webId
        });
        if (!_.isUndefined(lw)) {
            this.windows = _.without(this.windows, lw);
        }
    }
};

module.exports.LinWindow = LinWindow;
module.exports.LinWindowManager = LinWindowManager;

