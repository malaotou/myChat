import { NgModule, isDevMode } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MychatComponent } from './mychat.component';
import { ChatComponent } from './chat/chat.component';
import { ItemComponent } from './item/item.component';
import { EmojiPickerModule } from 'angular2-emoji-picker';
import { NgRedux, NgReduxModule, DevToolsExtension } from 'ng2-redux';
import { IAppState, rootReducer, INITIAL_STATE } from './store/store';
@NgModule({
  imports: [
    CommonModule,
    NgReduxModule,
    EmojiPickerModule.forRoot(),
  ],
  declarations: [
    MychatComponent,
    ChatComponent,
    ItemComponent,
  ]

})
export class ChatModule {
  constructor(ngRedux: NgRedux<IAppState>, devtools: DevToolsExtension) {
    var enhance = isDevMode() ? [devtools.enhancer()] : []
    ngRedux.configureStore(rootReducer, INITIAL_STATE,[], enhance)
  }
}
