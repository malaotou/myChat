'use strict'


function response(isSuccess,message,data){
    this.isSuccess=isSuccess,
    this.message=message,
    this.data=data
}

module.exports=response;