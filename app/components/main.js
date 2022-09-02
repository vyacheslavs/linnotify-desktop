import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

/*global api*/

export default class MainComponent extends Component {

  @tracked title = '';
  @tracked text = '';
  @tracked winId = undefined;

  constructor(owner, args) {
    super(owner, args);

    api.handle('notification-data', (data) => {
      this.title = data.title;
      this.text = data.text;
      this.winId = data.id;
    });

    api.send('ready', 'ready to listen');
  }
}
