import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

/*global api*/

export default class MainComponent extends Component {
  @tracked main_notification = null;
  @tracked multiple_notifications = false;
  @tracked notifications = [];

  constructor(owner, args) {
    super(owner, args);

    if (typeof api !== 'undefined') {
      api.handle('notification-data', (data) => {
        let notification = Object.assign({}, data);
        let idx = 0;
        for (idx = 0; idx < this.notifications.length; idx++)
          if (this.notifications[idx].notify_id == notification.notify_id)
            break;

        if (idx == this.notifications.length) {
          if (!notification.removal) {
            this.notifications = [...this.notifications, notification];
          }
        } else {
          if (notification.removal) {
            this.notifications.splice(idx, 1);
          } else {
            this.notifications[idx] = notification;
          }
        }

        this.multiple_notifications = this.notifications.length > 1;

        if (this.notifications.length > 0) {
          this.main_notification = this.notifications[0];
          this.notifications = Object.assign(this.notifications);
        } else {
          // no notification left here, remove this window
          this.closeWindow();
        }
      });
      api.send('ready', 'ready to listen');
    }
  }

  @action
  closeWindow() {
    if (typeof api !== 'undefined') {
      api.send('control', { action: 'close' });
    }
  }

  @action
  closeSubNotification(notif) {
    // remove notification with notif id

    let idx = 0;
    for (idx = 0; idx < this.notifications.length; idx++)
      if (this.notifications[idx].notify_id == notif) break;

    if (idx != this.notifications.length) {
      this.notifications.splice(idx, 1);

      if (this.notifications.length > 0)
        this.main_notification = this.notifications[0];
      else {
        // no notification left here, remove this window
        this.closeWindow();
      }

      this.notifications = Object.assign(this.notifications);
    }
  }

  onRender(entry) {
    if (typeof api !== 'undefined') {
      api.send('control', {
        action: 'resize',
        width: entry.borderBoxSize[0].inlineSize,
        height: entry.borderBoxSize[0].blockSize,
      });
    }
  }
}
