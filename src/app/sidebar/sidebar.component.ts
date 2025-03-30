import { Component, OnInit, OnDestroy } from '@angular/core';
import { APIServiceService } from "../Services/apiservice.service";
import { UserService } from "../Services/user.service";
import { UserDetails } from "../Models/UserDetails";
import { Router } from '@angular/router';
import { MessageNotificationService } from '../Services/message-notification.service';  // Import the service
import { Group } from '../Models/Group'; // Assuming you have a Group model defined
@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  standalone: false,
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit, OnDestroy {
  contacts: UserDetails[] = [];
  filteredContacts: UserDetails[] = [];
  groups: Group[] = []; // Assuming you have a Group model defined
  filteredGroups: Group[] = [];
  searchQuery: string = '';
  private messageSentSubscription: any;
  showMenu: boolean = false; // Initialize showMenu to false

  constructor(
    private api: APIServiceService,
    private userService: UserService,
    private router: Router,
    private messageNotificationService: MessageNotificationService  // Inject the service
  ) { }

  ngOnInit() {
    const userString = localStorage.getItem('user');
    const user: UserDetails = userString ? JSON.parse(userString) : null;
    if (!user) {
      console.error('User not found in localStorage');
      return;
    }

    this.api.GetContact(user.user_id).subscribe(
      (data: number[]) => {
        console.log("User receiver id for contacts", data);

        if (data.length === 0) {
          console.log("No contacts found. Waiting for new messages...");
          return;
        }

        this.api.GetUsersSet(data).subscribe(
          (users: UserDetails[]) => {
            this.contacts = users;
            this.filteredContacts = users; // Initialize filteredContacts
            console.log("User Contacts", this.contacts);
          },
          (error) => {
            console.log("Error fetching users:", error);
          }
        );
      },
      (error) => {
        console.log("Error fetching contacts:", error);
      }
    );

    // Fetch groups
    this.api.GetGroupsOfUser(user.user_id).subscribe(
      (groupIds: number[]) => {
        if (groupIds.length === 0) {
          console.log("No groups found.");
          return;
        }

        const groupRequests = groupIds.map(groupId =>
          this.api.GetGroupInfo(groupId)
        );

        Promise.all(groupRequests.map(req => req.toPromise())).then(
          (groups: Group[]) => {
            this.groups = groups;
            this.filteredGroups = groups;
          },
          (error) => {
            console.error("Error fetching group info:", error);
          }
        );
      },
      (error) => {
        console.error("Error fetching groups:", error);
      }
    );

    // Subscribe to the messageSent observable
    this.messageSentSubscription = this.messageNotificationService.messageSent$.subscribe(() => {
      this.reloadContacts();  // Reload contacts when a message is sent
    });
  }

  ngOnDestroy() {
    // Unsubscribe to avoid memory leaks
    if (this.messageSentSubscription) {
      this.messageSentSubscription.unsubscribe();
    }
  }

  reloadContacts() {
    const userString = localStorage.getItem('user');
    const user: UserDetails = userString ? JSON.parse(userString) : null;
    if (!user) {
      console.error('User not found in localStorage');
      return;
    }

    this.api.GetContact(user.user_id).subscribe(
      (data: number[]) => {
        console.log("User receiver id for contacts", data);

        if (data.length === 0) {
          console.log("No contacts found. Waiting for new messages...");
          return;
        }

        this.api.GetUsersSet(data).subscribe(
          (users: UserDetails[]) => {
            this.contacts = users;
            this.filteredContacts = users; // Initialize filteredContacts
            console.log("User Contacts", this.contacts);
          },
          (error) => {
            console.log("Error fetching users:", error);
          }
        );
      },
      (error) => {
        console.log("Error fetching contacts:", error);
      }
    );
  }

  filterContacts(): void {
    const query = this.searchQuery.toLowerCase().trim();
    this.filteredContacts = this.contacts.filter(contact =>
      contact.username.toLowerCase().includes(query) || 
      contact.phone_number.includes(query) // Matches username or phone number
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
}
