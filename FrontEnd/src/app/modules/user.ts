export class user {
    id:number;
    account:string;
    password:string;
    avatar:Blob ;
    nickname:string;
    name:string;
    gender:number;
    creator:number;
    created_date:Date;
    modified_by:number;
    modified_date:Date;
    createdAt:Date;
    updatedAt:Date;
    status:number;//组成员，新增，删除标识
    fileaddress:string;
    fileExt:string;
    // constructor(
    //     public Account:string,
    //     public OldPwd: string,
    //     public NewPwd: string,
    //     public Pwd2: string
    //   ) {  }
    static fromJSON(json: any): user {
        let object = Object.create(user.prototype);
        Object.assign(object, json);
        return object;
    }
}
