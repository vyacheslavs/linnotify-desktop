import { helper } from '@ember/component/helper';

export default helper(function calcPercent([c, max]) {
  let res = Math.round(c * 100 / max);
  return res;
});
