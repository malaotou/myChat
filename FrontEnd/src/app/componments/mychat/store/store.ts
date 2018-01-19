import { concat } from 'rxjs/observable/concat';
import { Message } from './../../../modules/message';
import { IAppState, UsersState } from './store';
import { Action } from 'redux';
import { Topic } from '../../../modules/topic';
import { SEND_MESSAGE } from './action'
export interface IAppState {
    users?: any,
    Topics?: Topic[],
    Messages?: Map<number, Message[]>,
    currentTopic?: Topic
}
export interface UsersState {
    currentUser: any;
}
const initialUserState: UsersState =
    {
        currentUser: null
    }
export function rootReducer(state: IAppState, action: any): IAppState {
    console.log(state, action, 'get reducr=er');
    switch (action.type) {
        case SEND_MESSAGE:
            return sendMessage(state, action);
        default:
            return state;
    }
}

export const INITIAL_STATE: IAppState = {
    users: initialUserState,
    currentTopic: null,
    Messages: null,
    Topics: null
}

interface sendMessageAction {
    action: any;
    topicid: number,
    message: any;
}

function sendMessage(state: IAppState, action: sendMessageAction): IAppState {
    if (action.topicid != null) {
        // 获取当前Message
        var messages: Map<number, Array<any>>;
        var map = new Map<number, Array<any>>();
        if (state.Messages == null) {
            messages = Object.assign({}, map.set(action.topicid, [action.message]));
            return Object.assign({}, state, {
                Messages: messages
            });
        }
        else if (state.Messages != null) {
            var msg = messages.get(action.topicid);
            Array.prototype.concat(messages, [action.message]);

            return Object.assign({}, state, {
                Messages: null
            });
        }
    }
    else {
        return Object.assign({}, state, {
            Messages: null
        });
    }


}