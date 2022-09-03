import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

/*global api*/

export default class MainComponent extends Component {
  @tracked title = '';
  @tracked text = '';
  @tracked winId = undefined;

  constructor(owner, args) {
    super(owner, args);

    if (typeof api !== 'undefined') {
      api.handle('notification-data', (data) => {
        this.title = data.title;
        this.text = data.text;
        this.winId = data.id;
      });
      api.send('ready', 'ready to listen');
    }
  }

  @action
  closeWindow() {
    api.send('control', 'close');
  }
}
