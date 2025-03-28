import { UserService } from './../Services/user.service';
import { Component } from '@angular/core';
import { APIServiceService } from '../Services/apiservice.service';
import { UserDetails } from '../Models/UserDetails';
import { Message } from '../Models/Message';

@Component({
  selector: 'app-sidebar',
  standalone: false,
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {

  constructor(
    private api: APIServiceService,
    private userService: UserService
  ) { }

  contacts:UserDetails[]=[];

  ngOnInit(){
    const userString = localStorage.getItem('user');
    const user: UserDetails = userString ? JSON.parse(userString) : null;
    if (!user) {
      console.error('User not found in localStorage');
      return;
    }
    this.api.GetContact(user.user_id).subscribe(
      (data:number[])=>{
        if(data){
          console.log("User reciever id for contacts",data);
          this.api.GetUsersSet(data).subscribe(
            (users:UserDetails[])=>{
              this.contacts=users;
              console.log("User Contacts",this.contacts);
              console.log("User Details for contacts",user);
            },
            (error)=>{
              console.log(error);
            }
          );
        }
      }
    );
  }

  logout(){
    this.userService.clearUser();
  }

}
