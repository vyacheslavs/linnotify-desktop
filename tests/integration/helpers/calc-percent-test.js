import { module, test } from 'qunit';
import { setupRenderingTest } from 'linnotify/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Helper | calc-percent', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    this.set('inputValue1', '45');
    this.set('inputValue2', '100');

    await render(hbs`{{calc-percent this.inputValue1 this.inputValue2}}`);

    assert.dom(this.element).hasText('45');
  });
});
