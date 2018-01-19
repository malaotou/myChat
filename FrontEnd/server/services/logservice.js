var socketService;

module.exports = logService = {
  writeError(funcName, message) {
    global.SKS.emit('log', funcName, message,new Date().toLocaleTimeString());
    console.log(global.SKS.id);
  },
  writeInfo(funcName, message) {
    global.SKS.emit('log',funcName, message,new Date().toLocaleTimeString());
    console.log(global.SKS.id);
  },
  writeDebug(funcName, message) {
    global.SKS.emit('log', funcName, message,new Date().toLocaleTimeString());
    console.log(global.SKS.id);
  },
  socket(socket) {
    //this.socketService = socket;
    global.SKS = socket;
  }

}
