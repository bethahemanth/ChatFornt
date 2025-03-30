import { Component, OnInit, OnDestroy, ViewChild, AfterViewChecked } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { APIServiceService } from '../../Services/apiservice.service';
import { UserDetails } from '../../Models/UserDetails';
import { Message } from '../../Models/Message';
import { MessageNotificationService } from '../../Services/message-notification.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  standalone:false,
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

  scrollToBottomFlag: boolean = false;
  newMessageReceived: boolean = false;

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
  
  
  // ✅ Send message and trigger UI updates
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
        console.log('Message sent successfully:', response);
        this.messages.push(message);
        this.messageText = '';
        this.newMessageReceived = true;
        this.scrollToBottomFlag = true;

        this.messageNotificationService.notifyMessageSent();
      },
      (error) => {
        console.error('Error sending message:', error);
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
}
