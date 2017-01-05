/**
 * Created by meathill on 2017/1/5.
 */
const {remote} = require('electron');
const {Menu, MenuItem}  = remote;

let rightClickPosition = null;
const menu = new Menu();
const menuItem = new MenuItem({
  label: '审查元素',
  click() {
    remote.getCurrentWebContents().inspectElement(rightClickPosition.x, rightClickPosition.y);
  }
});
menu.append(menuItem);

window.addEventListener('contextmenu', event => {
  event.preventDefault();
  rightClickPosition = {
    x: event.x,
    y: event.y
  };
  menu.popup(remote.getCurrentWindow());
}, false);