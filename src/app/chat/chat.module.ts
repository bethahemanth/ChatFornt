import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NewChatComponent } from './new-chat/new-chat.component';
import { ChatComponent } from './chat/chat.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'; // Ensure these are imported
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [
    NewChatComponent,
    ChatComponent
  ],
  imports: [
    CommonModule, // Required for ngClass and date pipe
    FormsModule, // Required for ngModel
    ReactiveFormsModule,
    HttpClientModule
  ],
  exports:[
    NewChatComponent,
    ChatComponent
  ]
})
export class ChatModule { }
