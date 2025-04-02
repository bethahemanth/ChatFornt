import { AfterViewChecked, Component, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Message } from '../../Models/Message';
import { UserDetails } from '../../Models/UserDetails';
import { APIServiceService } from '../../Services/apiservice.service';
import { MessageNotificationService } from '../../Services/message-notification.service';
import { Group } from '../../Models/Group';

@Component({
  selector: 'app-group-chat',
  standalone: false,
  templateUrl: './group-chat.component.html',
  styleUrls: ['./group-chat.component.css']
})
export class GroupChatComponent implements OnInit, OnDestroy, AfterViewChecked {
  user!: UserDetails;
  groupId!: number;
  groupDetails!: Group;
  groupMembers: UserDetails[] = [];
  messageText: string = '';
  messages: Message[] = [];
  isDropdownVisible: boolean = false; // To toggle dropdown visibility
  private fetchMessagesInterval: any;

  scrollToBottomFlag: boolean = false; // Flag to check if we need to scroll to bottom
  newMessageReceived: boolean = false; // Flag to check if a new message has been received

  @ViewChild('messagesContainer') messagesContainer: any; // Reference to the messages container

  constructor(
    private api: APIServiceService,
    private route: ActivatedRoute,
    private messageNotificationService: MessageNotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Retrieve the user from localStorage
    const userString = localStorage.getItem('user');
    this.user = userString ? JSON.parse(userString) : null;

    // Extract the 'id' parameter from the URL
    this.route.queryParams.subscribe(params => {
      this.groupId = +params['id'];
      console.log('Group ID:', this.groupId);

      // Fetch group details
      this.fetchGroupDetails();

      // Fetch group members
      this.fetchGroupMembers();

      // Fetch initial messages for the group chat
      this.fetchMessages();

      // Set up periodic fetching of new messages every 5 seconds
      this.fetchMessagesInterval = setInterval(() => {
        this.fetchMessages();
      }, 5000);
    });
  }

  ngOnDestroy(): void {
    if (this.fetchMessagesInterval) {
      clearInterval(this.fetchMessagesInterval);
    }
  }

  ngAfterViewChecked(): void {
    if (this.scrollToBottomFlag) {
      this.scrollToBottom();
      this.scrollToBottomFlag = false;
    }
  }

  fetchGroupDetails(): void {
    this.api.GetGroupInfo(this.groupId).subscribe(
      (group: Group) => {
        this.groupDetails = group;
        console.log('Group Details:', group);
      },
      (error) => {
        console.error('Error fetching group details:', error);
      }
    );
  }

  fetchGroupMembers(): void {
    this.api.GetMembersOfGroup(this.groupId).subscribe(
      (members: UserDetails[]) => {
        this.groupMembers = members;
        console.log('Group Members:', members);
      },
      (error) => {
        console.error('Error fetching group members:', error);
      }
    );
  }

  toggleDropdown(event: Event): void {
    event.stopPropagation(); // Prevent click from propagating to the document
    this.isDropdownVisible = !this.isDropdownVisible;
  }

  @HostListener('document:click', ['$event'])
  closeDropdown(event: Event): void {
    this.isDropdownVisible = false; // Close dropdown when clicking outside
  }

  fetchMessages(): void {
    this.api.GetGroupMessages(this.groupId).subscribe(
      (data: Message[]) => {
        const filteredMessages = data.filter(message => message.message.trim() !== '');
        const isNewMessage = this.messages.length !== filteredMessages.length;
        if (isNewMessage) {
          this.messages = filteredMessages;
          this.newMessageReceived = true;
          this.scrollToBottomFlag = true;
        }
      },
      (error) => {
        console.error('Error fetching messages for group:', error);
      }
    );
  }

  sendMessage(): void {
    const message: Message = {
      message_id: 0,
      sender_id: this.user.user_id,
      receiver_id: this.groupId+10000,
      message: this.messageText,
      created_at: new Date(),
      destroy_at: new Date(new Date().getTime() + 3600000)
    };

    this.api.SendMessage(message).subscribe(
      (response) => {
        console.log('Message sent successfully:', response);
        this.messages.push(message);
        this.messageText = '';
        this.newMessageReceived = true;
        this.scrollToBottomFlag = true;
      },
      (error) => {
        console.error('Error sending message:', error);
      }
    );
  }

  redirectToChat(userId: number): void {
    this.router.navigate(['/chat'], { queryParams: { id: userId } });
  }

  deleteMessage(messageId: number): void {
    if (!confirm('Are you sure you want to delete this message?')) return;

    this.api.DeleteMessage(messageId).subscribe(
      () => {
        this.messages = this.messages.filter(msg => msg.message_id !== messageId);
        this.api.CustomAlert('Message deleted successfully!');
      },
      (error) => {
        console.error('Error deleting message:', error);
      }
    );
  }

  scrollToBottom(): void {
    try {
      this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
    } catch (err) {
      console.error('Error scrolling to bottom:', err);
    }
  }
}

