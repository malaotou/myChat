import {User} from './interface/user'

export class Staff implements User {
    id: number;
    name: string;
    constructor(name:string){
        this.name=name;
    }
    isStaff(): boolean {
        return true;
    }   
}
