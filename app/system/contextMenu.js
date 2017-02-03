/**
 * Created by meathill on 2017/1/5.
 */
const {remote} = require('electron');
const {Menu}  = remote;
const {DEBUG} = require('../../config/config.json');

const tpl = [
  {
    label: '复制',
    role: 'copy'
  },
  {
    label: '剪切',
    role: 'cut'
  },
  {
    label: '粘贴',
    role: 'paste'
  },
  {
    type: 'separator'
  }
];
let rightClickPosition = null;
if (DEBUG) {
  tpl.push({
    label: '审查元素',
    click() {
      remote.getCurrentWebContents().inspectElement(rightClickPosition.x, rightClickPosition.y);
    }
  })
}
const menu = Menu.buildFromTemplate(tpl);

window.addEventListener('contextmenu', event => {
  event.preventDefault();
  rightClickPosition = {
    x: event.x,
    y: event.y
  };
  menu.popup(remote.getCurrentWindow());
}, false);