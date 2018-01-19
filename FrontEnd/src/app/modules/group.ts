export class Group {
    id:number;
    avatarsrc:Blob;
    name:string;
    description:string;
    companyId:number;
    disabled:number;
    approve:number;
    createdAt:Date;
    updatedAt:Date;
    creator:number;
    created_date:Date;
    modified_by:number;
    modified_date:number;
    fileExt:string;
    fileaddress:string;
    constructor(){
        this.id=0;
        this.avatarsrc=null;
        this.name=null;
        this.description=null;
        this.fileExt=null;
    }
    static fromJSON(json: any): Group {
        let object = Object.create(Group.prototype);
        Object.assign(object, json);
        return object;
    }
}
