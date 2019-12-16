const {app} = require('electron');

export default [
  {
    label: "Meart",
    submenu: [
      {
        label: "关于 Meart",
        selector: "orderFrontStandardAboutPanel:"
      },
      {
        type: "separator"
      },
      {
        label: "退出",
        accelerator: "Command+Q",
        click: function() {
          app.quit();
        }
      }
    ]
  },
  {
    label: "编辑",
    submenu: [
      {
        label: "撤销",
        accelerator: "CmdOrCtrl+Z",
        selector: "undo:"
      },
      {
        label: "重做",
        accelerator: "Shift+CmdOrCtrl+Z",
        selector: "redo:"
      },
      {
        type: "separator"
      },
      {
        label: "剪切",
        accelerator: "CmdOrCtrl+X",
        selector: "cut:"
      },
      {
        label: "复制",
        accelerator: "CmdOrCtrl+C",
        selector: "copy:"
      },
      {
        label: "粘贴",
        accelerator: "CmdOrCtrl+V",
        selector: "paste:"
      },
      {
        label: "全选",
        accelerator: "CmdOrCtrl+A",
        selector: "selectAll:"
      }
    ]
  }
];