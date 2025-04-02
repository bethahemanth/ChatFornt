import { Component, OnInit, OnDestroy } from '@angular/core';
import { APIServiceService } from "../Services/apiservice.service";
import { UserService } from "../Services/user.service";
import { UserDetails } from "../Models/UserDetails";
import { Router } from '@angular/router';
import { MessageNotificationService } from '../Services/message-notification.service';  
import { Group } from '../Models/Group'; 
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  standalone: false,
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit, OnDestroy {
  contacts: UserDetails[] = [];
  filteredContacts: UserDetails[] = [];
  groups: Group[] = []; 
  filteredGroups: Group[] = [];
  searchQuery: string = '';
  private messageSentSubscription!: Subscription;
  showMenu: boolean = false;
  currentchat: number = -1;
  oldchat: number = -1;
  private user!: UserDetails;

  constructor(
    private api: APIServiceService,
    private userService: UserService,
    private router: Router,
    private messageNotificationService: MessageNotificationService
  ) { }

  ngOnInit() {
    const userString = localStorage.getItem('user');
    this.user = userString ? JSON.parse(userString) : null;
    if (!this.user) {
      console.error('User not found in localStorage');
      return;
    }

    this.fetchLatestUserById(this.user.user_id);
    this.loadContacts();
    this.loadGroups(this.user.user_id);
    
  }
  

  fetchLatestUserById(user_id: number): void {
    this.api.GetLastestUserById(user_id).subscribe(
      (response: any) => {
        console.log("Fetched latest user ID:", response);

        if (this.currentchat === -1) {
          this.currentchat = response;
          this.oldchat = response;
          this.router.navigate(['chat'], { queryParams: { id: response } });
        } 
        else if (response !== this.currentchat) {
          this.oldchat = this.currentchat;  
          this.currentchat = response;

          this.api.CustomAlert("New message received from user ID: " + response);
        }

        console.log("Current chat: " + this.currentchat + " | Old chat: " + this.oldchat);
      },
      (error) => {
        console.error('Error fetching latest user data:', error);
      }
    );
}



  loadContacts() {
    if (!this.user) return;

    this.api.GetContact(this.user.user_id).subscribe(
      (data: number[]) => {
        if (data.length === 0) {
          console.log("No contacts found. Waiting for new messages...");
          return;
        }

        this.api.GetUsersSet(data).subscribe(
          (users: UserDetails[]) => {
            this.processProfilePictures(users);
            this.contacts = users;
            this.filteredContacts = users;
          },
          (error) => console.error("Error fetching users:", error)
        );
      },
      (error) => console.error("Error fetching contacts:", error)
    );
  }

  loadGroups(userId: number) {
    this.api.GetGroupsOfUser(userId).subscribe(
      (groupIds: number[]) => {
        if (groupIds.length === 0) {
          console.log("No groups found.");
          return;
        }

        const groupRequests = groupIds.map(groupId => this.api.GetGroupInfo(groupId).toPromise());
        Promise.all(groupRequests).then(
          (groups: Group[]) => {
            this.groups = groups;
            this.filteredGroups = groups;
          },
          (error) => console.error("Error fetching group info:", error)
        );
      },
      (error) => console.error("Error fetching groups:", error)
    );
  }

  reloadContacts() {
    console.log("Reloading contacts...");
    if (this.user) {
      this.fetchLatestUserById(this.user.user_id);
      this.loadContacts();
    }
  }

  private processProfilePictures(users: UserDetails[]) {
    users.forEach(user => {
      if (user.profile_picture && !user.profile_picture.startsWith('http://localhost:5195/uploads/')) {
        user.profile_picture = `http://localhost:5195/uploads/${user.profile_picture}`;
      }
    });
  }

  filterContacts(): void {
    const query = this.searchQuery.toLowerCase().trim();
    this.filteredContacts = this.contacts.filter(contact =>
      contact.username.toLowerCase().includes(query) || contact.phone_number.includes(query)
    );
  }

  filterGroups(): void {
    const query = this.searchQuery.toLowerCase().trim();
    this.filteredGroups = this.groups.filter(group =>
      group.group_name.toLowerCase().includes(query)
    );
  }

  toggleMenu() {
    this.showMenu = !this.showMenu;
  }

  logout() {
    this.router.navigate(['']);
    this.userService.clearUser();
  }

  ngOnDestroy() {
    if (this.messageSentSubscription) {
      this.messageSentSubscription.unsubscribe();
    }
  }
} 