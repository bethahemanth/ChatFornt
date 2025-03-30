import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { AppComponent } from './app.component';
import { ChatComponent } from './chat/chat/chat.component';
import { NewChatComponent } from './chat/new-chat/new-chat.component';
import { GroupChatComponent } from './chat/group-chat/group-chat.component';

const routes: Routes = [
  { path: 'chat', component: ChatComponent },
  {path:'new-chat', component:NewChatComponent},
  { path: 'login', component: LoginComponent },
  { path:'group', component: GroupChatComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }