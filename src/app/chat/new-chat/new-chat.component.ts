import { Component, ElementRef, Renderer2, AfterViewInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { APIServiceService } from '../../Services/apiservice.service';
import { UserDetails } from '../../Models/UserDetails';
import { Message } from '../../Models/Message';

@Component({
  selector: 'app-new-chat',
  standalone: false,
  templateUrl: './new-chat.component.html',
  styleUrls: ['./new-chat.component.css']
})
export class NewChatComponent implements AfterViewInit, OnDestroy {
  phoneNumber: string = '';
  email: string = '';
  searchResults: UserDetails[] = [];  
  currentUser: UserDetails | null = null;
  searchDropdownVisible: boolean = false;  

  constructor(
    private api: APIServiceService,
    private router: Router,
    private el: ElementRef,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    const userString = localStorage.getItem('user');
    this.currentUser = userString ? JSON.parse(userString) : null;

    if (!this.currentUser) {
      console.error('No user found in localStorage');
    }
  }

  ngAfterViewInit(): void {
    this.renderer.listen('document', 'click', (event: Event) => {
      const clickedInside = this.el.nativeElement.contains(event.target);
      if (!clickedInside) {
        this.searchDropdownVisible = false;  // Close the dropdown if clicked outside
      }
    });
  }

  ngOnDestroy(): void {
    // Clean up the listener when the component is destroyed
    this.searchDropdownVisible = false;
  }

  searchUser(event: Event): void {
    event.preventDefault();
    this.searchDropdownVisible = true;  // Show the dropdown when typing

    // If either phone number or email is provided, search the users
    this.api.GetAllUsers().subscribe(
      (users: UserDetails[]) => {
        // Filter users based on partial match (includes method for substring matching)
        this.searchResults = users.filter((user) => {
          const searchTerm = this.phoneNumber.trim().toLowerCase() || this.email.trim().toLowerCase();
          return (
            (user.phone_number.toLowerCase().includes(searchTerm) || 
            user.email.toLowerCase().includes(searchTerm))
          );
        });
      },
      (error) => {
        console.error('Error fetching users:', error);
      }
    );
  }

  selectUser(user: UserDetails): void {
    const message: Message = {
      message_id: 0,
      sender_id: user.user_id,
      receiver_id: this.currentUser?.user_id ?? 0,
      message: "",
      created_at: new Date(),
      destroy_at: new Date(),
    };

    this.api.SendMessage(message).subscribe((response) => {
      console.log('Message sent successfully:', response);
    });

    this.router.navigate(['/chat'], { queryParams: { id: user.user_id } });
    this.searchDropdownVisible = false;  // Close the dropdown after selecting a user
  }
}
