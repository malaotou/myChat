import {User} from './interface/user'
export class Customer implements User{
    id: number;
    name: string;
    constructor(name:string){
        this.name=name;
    }

}
