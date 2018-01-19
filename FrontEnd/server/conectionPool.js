var config=require('./config').db;
var poolModule=require('generic-pool');
var mySql=require('mysql');
/*var pool=poolModule.createPool({
    name:'mysql',
    create:function(callback){
        var conn=mySql.createConnection({
            'host':config.host,
            'port':config.port,
            'user':config.user,
            'password':config.password,
            'database':config.database
        });
        //conn.connect();
        callback(null,conn);
    },
    // 释放一个连接的 handler
    destroy  : function(client) { client.end(); },
    // 连接池中最大连接数量
    max      : 10,
    // 连接池中最少连接数量
    min      : 2, 
    // 如果一个线程3秒钟内没有被使用过的话。那么就释放
    idleTimeoutMillis : 30000,
    // 如果 设置为 true 的话，就是使用 console.log 打印入职，当然你可以传递一个 function 最为作为日志记录handler
    log : true 
})
 
module.exports = pool;*/
 
 /**
 * Step 1 - Create pool using a factory object
 */
const factory = {
    create: function(){
         return new Promise(function(resolve, reject){
            var client = mySql.createConnection({
                'host':config.host,
                'port':config.port,
                'user':config.user,
                'password':config.password,
                'database':config.database
            });
            client.on('connected', function(){
                resolve(client)
            })
        })
    },
    destroy: function(client){
        return new Promise(function(resolve){
          client.on('end', function(){
            resolve()
          })
          client.disconnect()
        })
    }
}
 
var opts = {
    max: 10, // maximum size of the pool
    min: 2 // minimum size of the pool
}
 
module.exports = poolModule.createPool(factory, opts)