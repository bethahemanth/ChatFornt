import { Component, OnInit, OnDestroy, ViewChild, AfterViewChecked, HostListener } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { APIServiceService } from '../../Services/apiservice.service';
import { UserDetails } from '../../Models/UserDetails';
import { Message } from '../../Models/Message';
import { MessageNotificationService } from '../../Services/message-notification.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  standalone: false,
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewChecked {
  user!: UserDetails;
  receiverId!: number;
  messageText: string = '';
  messages: Message[] = [];
  private fetchMessagesInterval: any;
  receiver: string = "";
  receiverProfilePicture: string = ""; 
  messageCountMap: { [receiverId: number]: number } = {}; // Track message count per receiver

  scrollToBottomFlag: boolean = false;
  newMessageReceived: boolean = false;

  showProfilePicPopup: boolean = false; // Added for profile picture popup

  @ViewChild('messagesContainer') messagesContainer: any;

  constructor(
    private api: APIServiceService,
    private route: ActivatedRoute,
    private messageNotificationService: MessageNotificationService
  ) { }

  ngOnInit(): void {
    const userString = localStorage.getItem('user');
    this.user = userString ? JSON.parse(userString) : null;

   
    this.route.queryParams.subscribe(params => {
      this.receiverId = +params['id'];
      console.log('Receiver ID:', this.receiverId);

      this.fetchReceiverDetails();
      this.fetchMessages();

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

  // Fetch the latest user by ID to get user details after login
 

  // ✅ Fetch messages and prevent duplicates
  fetchMessages(): void {
    this.api.GetAllMessages(this.user.user_id, this.receiverId).subscribe(
      (data: Message[]) => {
        const filteredMessages = data.filter(msg => msg.message.trim() !== '');
        const isNewMessage = this.messages.length !== filteredMessages.length;
        if (isNewMessage) {
          this.messages = filteredMessages;
          this.newMessageReceived = true;
          this.scrollToBottomFlag = true;
        }
      },
      (error) => {
        console.error('Error fetching messages:', error);
      }
    );
  }

  fetchReceiverDetails(): void {
    this.api.GetUserByID(this.receiverId).subscribe(
      (receiverDetails: UserDetails) => {
        this.receiver = receiverDetails.username;
  
        if (receiverDetails.profile_picture) {
          receiverDetails.profile_picture = receiverDetails.profile_picture.replace(/(http:\/\/localhost:5195\/uploads\/)+/g, "http://localhost:5195/uploads/");

          if (!receiverDetails.profile_picture.startsWith("http://")) {
            receiverDetails.profile_picture = `http://localhost:5195/uploads/${receiverDetails.profile_picture}`;
          }
        }
  
        this.receiverProfilePicture = receiverDetails.profile_picture;
        console.log('✅ Fixed Receiver Profile Picture:', this.receiverProfilePicture);
      },
      (error) => {
        console.error('❌ Error fetching receiver details:', error);
      }
    );
  }

 sendMessage(): void {
  if (!this.messageText.trim()) return;

  const message: Message = {
    message_id: 0,
    sender_id: this.user.user_id,
    receiver_id: this.receiverId,
    message: this.messageText,
    created_at: new Date(),
    destroy_at: new Date(new Date().getTime() + 3600000)
  };

  this.api.SendMessage(message).subscribe(
    (response) => {
      this.api.CustomAlert('Message sent successfully:');
      this.messages.push(message);
      this.messageText = '';
      this.newMessageReceived = true;
      this.scrollToBottomFlag = true;

      // Update message count for the receiverId
      if (this.messageCountMap[this.receiverId]) {
        this.messageCountMap[this.receiverId]++;
        console.log(`Updated message count for receiverId ${this.receiverId}: ${this.messageCountMap[this.receiverId]}`);
      } else {
        this.messageCountMap[this.receiverId] = 1;
      }

      // ✅ Notify the SidebarComponent
      this.messageNotificationService.notifyMessageSent();

      // ✅ Optionally, update message count in Sidebar
      this.updateSidebarMessageCount(this.receiverId, this.messageCountMap[this.receiverId]);
    },
    (error) => {
      console.error('Error sending message:', error);
    }
  );
}

  // ✅ Update the sidebar message count
  updateSidebarMessageCount(receiverId: number, count: number): void {
    console.log(`Updating sidebar message count for receiverId ${receiverId}  with count ${count}`);
    // Add logic here to update the sidebar UI or notify other components
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

  // ✅ Scroll to bottom for new messages
  scrollToBottom(): void {
    try {
      this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
    } catch (err) {
      console.error('Error scrolling to bottom:', err);
    }
  }

  // Toggle Profile Picture Popup visibility
  toggleProfilePicPopup(): void {
    this.showProfilePicPopup = !this.showProfilePicPopup;
  }

  // Close Profile Picture Popup if clicked outside
  @HostListener('document:click', ['$event'])
  closePopupOnClickOutside(event: MouseEvent) {
    if (this.showProfilePicPopup && event.target instanceof Element && !event.target.closest('.profile-pic-popup') && !event.target.closest('.profile-pic')) {
      this.showProfilePicPopup = false;
    }
  }

  CustomAlert(message: string) {
    const notification = document.createElement('div');
    notification.className = 'custom-this.api.CustomAlert';
    notification.innerText = message;
    document.body.appendChild(notification);
    setTimeout(() => {
      notification.classList.add('fade-out');
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 500); // Match this duration with the CSS transition duration
    }, 2000);
  }
}
