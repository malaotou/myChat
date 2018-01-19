const electron = require('electron');
var request = require('request');
var path = require("path");
// const {
//   dialog
// } = require('electron')
const {
  shell,
  dialog
} = require('electron');

var fs = require('fs');


const app = electron.app
const Tray = electron.Tray
const Menu = electron.Menu
const ipc = electron.ipcMain
let tray = null

const BrowserWindow = electron.BrowserWindow
let mainWindow


let appIcon = null

// ipc.on('put-in-tray', function (event) {

//   const iconPath = path.join(__dirname, iconName)
//   appIcon = new Tray(iconPath)
//   const contextMenu = Menu.buildFromTemplate([{
//     label: '移除',
//     click: function () {
//       event.sender.send('tray-removed')
//     }
//   }])
//   appIcon.setToolTip('在托盘中的 Electron 示例.')
//   appIcon.setContextMenu(contextMenu)
// })

function createWindow() {

  mainWindow = new BrowserWindow({
    width: 900,
    height: 600,
    frame: false,
    //autoHideMenuBar:true,
    minWidth: 900,
    minHeight: 600,
    center: true,
    //alwaysOnTop:true,
    // skipTaskbar:false,
  })

  mainWindow.loadURL(`file://${__dirname}/index.html`)

  mainWindow.webContents.openDevTools()

  mainWindow.on('closed', function () {
    mainWindow = null
  })
}
app.on('ready', createWindow)

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow()
  }
})

// 根据路径获取对应的Icon信息
/*
ipc.on('getIcon', function (event, arg) {
  iconExtractor.emitter.on('icon', function(data){
    event.returnValue = data.Base64ImageData;
  });
  iconExtractor.getIcon('SomeContextLikeAName',arg);
})
*/

//窗口最小化
ipc.on('window-min', function () {
  mainWindow.minimize();
})
//窗口最大化
ipc.on('window-max', function () {
  if (mainWindow.isMaximized()) {
    mainWindow.restore();
  } else {
    mainWindow.maximize();
  }
})
//窗口关闭
ipc.on('window-close', function () {
  console.log("关闭");
  mainWindow.close();
})

// ipc.on('downloadFile', function (url, nb) {
//   download(url, name).then((filepath) => {
//     shell.openItem(filepath);
//   })
// });
ipc.on('download-file', function (event, url, name, fileid) {
  // download(url, name).then((fullname) => {
  //   //dialog.showErrorBox(fullname, name2);

  // })
  //dialog.showErrorBox(JSON.stringify(event), JSON.stringify(event));
  chkNameExistsAndDownload(url, name).then((finishname) => {
    event.sender.send('downloadFinished', fileid);
    shell.openItem(finishname);
  })
});

function download(url, name) {
  //dialog.showErrorBox(url, name);
  //chkNameExists(url, name);

}

function chkNameExistsAndDownload(url, name, index = 0) {

  return new Promise((resolve, reject) => {
    fs.exists(name + index, function (exists) {

      if (!exists) {
        //dialog.showErrorBox(exists.toString(), exists.toString());
        // 下载文件 并且打开文件
        downloadFile(url.replace('/thumb',''), index + name).then(filepath => {
          resolve(filepath)
        })

      } else {
        //继续 判断
        //dialog.showErrorBox(index.toString(), index.toString());
        // chkNameExistsAndDownload(url, name, index + 1)
        shell.openItem(name + index);
      }
    })
  })
}

function downloadFile(url, name) {
  return new Promise((resolve, reject) => {
    var stream = request(url).pipe(
      //是否存在文件
      //循环检测
      fs.createWriteStream(name)
    );
    stream.on('finish', function () {
      var filepath = path.resolve("./") + '\\' + name;
      resolve(filepath);
    });
  })
}
