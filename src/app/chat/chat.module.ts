import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NewChatComponent } from './new-chat/new-chat.component';
import { ChatComponent } from './chat/chat.component';



@NgModule({
  declarations: [
    NewChatComponent,
    ChatComponent
  ],
  imports: [
    CommonModule
  ]
})
export class ChatModule { }
