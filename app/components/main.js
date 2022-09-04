import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

/*global api*/

export default class MainComponent extends Component {
  @tracked title = '';
  @tracked text = '';
  @tracked winId = undefined;
  @tracked icon = '';
  @tracked big_text = '';

  constructor(owner, args) {
    super(owner, args);

    if (typeof api !== 'undefined') {
      api.handle('notification-data', (data) => {
        this.title = data.title;
        this.text = data.text;
        this.winId = data.id;
        this.icon = typeof data.icon != 'undefined' ? data.icon : '';
        this.big_text =
          typeof data.big_text != 'undefined' ? data.big_text : '';
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
