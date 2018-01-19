var fs = require('fs');
var uuid = require('uuid/v4');
var path = require('path');
var config = require('../../config').api;
var FileReader = require('filereader');
var images = require('images');
var ffmpeg = require('fluent-ffmpeg');
var ffmpegPath = require('../../config').ffmpegPath;
var logService = require('../logservice');
var fileRepo = {
  // Blob 类型文件    
  saveFile(filename, fileExt, blob) {
    console.log('Hello world')
    logService.writeInfo('fdsafds', 'Hello world')
    return new Promise((resolve, reject) => {
      try {
        //console.log(winPath);
        console.log(typeof (blob));
        var fileRoot = path.join(appRoot, 'upload');
        //解析当前文件路径是否存在
        if (!fs.existsSync(fileRoot)) {
          fs.mkdirSync(fileRoot);
        }
        var filepath = fileRoot + '/' + fileExt;
        console.log(filepath);
        if (!fs.existsSync(filepath)) {
          fs.mkdirSync(filepath);
        }
        // 最终文件路径，及文件名称。
        var uuidName = uuid();
        var filename = fileRoot + '/' + fileExt + '/' + uuidName + '.' + fileExt;
        //var filename = fileExt + '\\' + uuid() + '.' + fileExt;
        if (filename == null || fileExt == null || blob == null) {
          reject("文件名，文件扩展名，文件内容不能为空");
        } else {
          var base64Data = blob.replace(/^data:.*?;base64,/, "");
          var dataBuffer = new Buffer(base64Data, 'base64');
          //保存文件到指定目录
          fs.writeFile(filename, dataBuffer, function (err) {
            if (err) {
              reject(err)
            } else {
              var thumbnailDir = fileRoot + '/' + fileExt + '/thumb';
              var thumbnailName = fileRoot + '/' + fileExt + '/thumb/' + uuidName + '.' + fileExt;
              var videoDir = fileRoot + '/' + fileExt + '/MP4';
              var videoThumbnail = fileRoot + '/' + fileExt + '/thumb/';
              var returnAddress = '\/' + fileExt + '/thumb' + '\/' + uuidName + '.' + fileExt;
              var returnAddress2 = '\/' + fileExt + '\/' + uuidName + '.' + fileExt;
              if (fileExt.toLowerCase() == 'jpg' ||
                fileExt.toLowerCase() == 'jpeg' ||
                fileExt.toLowerCase() == 'png') {
                if (!fs.existsSync(thumbnailDir)) {
                  fs.mkdirSync(thumbnailDir);
                }
                images(filename).resize(200, 200).save(thumbnailName);
                resolve({
                  isImg: true,
                  address: returnAddress
                });
              } else if (fileExt.toLowerCase() == 'mov') {
                if (!fs.existsSync(videoDir)) {
                  fs.mkdirSync(videoDir);
                }
                var proc = ffmpeg(filename)
                  //.setFfmpegPath(ffmpegPath.winPath)
                  .format('mp4')
                  .save(videoDir + '/' + uuidName + '.mp4')
                  .scrennshots({
                    filename: uuidName,
                    count: 1,
                    folder: videoThumbnail
                  });
                resolve({
                  isImg: false,
                  address: returnAddress
                });
              } else if (fileExt == 'mp4') {
                if (!fs.existsSync(videoDir)) {
                  fs.mkdirSync(videoDir);
                }
                var proc = ffmpeg(filename)
                  //.setFfmpegPath(ffmpegPath.winPath)
                  //.format('mp4')
                  .save(videoDir + '/' + uuidName + '.mp4')
                  .screenshots({
                    filename: uuidName,
                    count: 1,
                    folder: videoThumbnail
                  });
                resolve({
                  isImg: false,
                  address: returnAddress
                });
              } else if (fileExt.toLowerCase() == 'wav' ||
                fileExt.toLowerCase() == 'mid' ||
                fileExt.toLowerCase() == 'mp3'
              ) {
                resolve({
                  isImg: false,
                  address: returnAddress2
                });

              } else {
                resolve({
                  isImg: false,
                  address: returnAddress2
                });
              }
            }
          });
        }
      } catch (err) {
        console.log(err);
      }
    });
  },
  saveMessageFile(messageId, filename, fileExt, blob) {
    return new Promise((resolve, reject) => {
      try {
        console.log(typeof (blob));
        var fileRoot = path.join(appRoot, 'upload');
        //解析当前文件路径是否存在
        if (!fs.existsSync(fileRoot)) {
          fs.mkdirSync(fileRoot);
        }
        var filepath = fileRoot + '/' + fileExt;
        console.log(filepath);
        if (!fs.existsSync(filepath)) {
          fs.mkdirSync(filepath);
        }
        // 最终文件路径，及文件名称。
        var filename = fileRoot + '/' + fileExt + '/' + uuid() + '.' + fileExt;
        //var filename = fileExt + '\\' + uuid() + '.' + fileExt;
        if (filename == null || fileExt == null || blob == null) {
          reject("文件名，文件扩展名，文件内容不能为空");
        } else {
          //base64字符串需要过滤data:URL
          var base64Data = blob.replace(/^data:.*?;base64,/, "");
          var dataBuffer = new Buffer(base64Data, 'base64');
          //保存文件到指定目录
          fs.writeFile(filename, dataBuffer, function (err) {
            if (err) {
              reject(err);
            } else {
              var guid = filename.split(fileExt)[1].substring(1, 37);
              var thumbnailDir = fileRoot + '/' + fileExt + '/thumbnail';
              var thumbnailName = fileRoot + '/' + fileExt + '/thumbnail/' + guid + '.' + fileExt;
              if (!fs.existsSync(thumbnailDir)) {
                fs.mkdirSync(thumbnailDir);
              }
              images(filename).resize(200, 200).save(thumbnailName);
              var returnAddress = '\/' + fileExt + '\/' + guid + '.' + fileExt;
              resolve(returnAddress);
            }
          });
        }
      } catch (err) {
        console.log(err);
      }
    });
  },
  saveFileV2() {
    return new Promise((resolve, reject) => {

    })
  },
  getFile(path) {
    return new Promise((resolve, reject) => {
      fs.readFile(path, function (err, data) {
        if (err) reject(err);
        if (data) resolve(data);
      })
    })
  }
}
module.exports = fileRepo;
