// import { Component, OnInit } from '@angular/core';
// import { ActivatedRoute } from '@angular/router';
// import { APIServiceService } from '../../Services/apiservice.service';
// import { UserDetails } from '../../Models/UserDetails';
// import { Message } from '../../Models/Message';
// @Component({
//   selector: 'app-chat',
//   standalone: false,
//   templateUrl: './chat.component.html',
//   styleUrl: './chat.component.css'
// })
// export class ChatComponent implements OnInit {
//   user!: UserDetails;
//   receiverId!: number;
//   messageText: string = '';
//   messages: Message[] = []; // Array to store messages

//   constructor(
//     private api: APIServiceService,
//     private route: ActivatedRoute
//   ) { }

//   ngOnInit(): void {
//     // Retrieve the user from localStorage
//     const userString = localStorage.getItem('user');
//     this.user = userString ? JSON.parse(userString) : null;

//     // Extract the 'id' parameter from the URL
//     this.route.queryParams.subscribe(params => {
//       this.receiverId = +params['id'];
//       console.log('Receiver ID:', this.receiverId);

//       // Fetch messages for the chat
//       this.fetchMessages();
//     });
//   }

//   fetchMessages(): void {
//     this.messages=[];
//     this.api.GetAllMessages(this.user.user_id, this.receiverId).subscribe(
//       (data: Message[]) => {
//         this.messages = data; // Initialize with the first set of messages
//         console.log('Messages from user to receiver:', this.messages);
//       },
//       (error) => {
//         console.error('Error fetching messages from user to receiver:', error);
//       }
//     );

//     this.api.GetAllMessages(this.receiverId, this.user.user_id).subscribe(
//       (data: Message[]) => {
//         this.messages = [...this.messages, ...data]; // Append the second set of messages
//         console.log('Messages after appending from receiver to user:', this.messages);
//       },
//       (error) => {
//         console.error('Error fetching messages from receiver to user:', error);
//       }
//     );
//   }

//   sendMessage(): void {
//     alert("sending message");
//     const message: Message = {
//       message_id: 0,
//       sender_id: this.user.user_id,
//       receiver_id: this.receiverId,
//       message: this.messageText,
//       created_at: new Date(),
//       destroy_at: new Date(new Date().getTime() + 3600000)
//     };

//     this.api.SendMessage(message).subscribe(
//       (response) => {
//         console.log('Message sent successfully:', response);
//         this.messages.push(message); // Add the new message to the list
//         this.messageText = ''; // Clear the input field
//       },
//       (error) => {
//         console.error('Error sending message:', error);
//       }
//     );
//     this.fetchMessages();
//   }
// }
import { Component, OnInit, OnDestroy, ViewChild, AfterViewChecked } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { APIServiceService } from '../../Services/apiservice.service';
import { UserDetails } from '../../Models/UserDetails';
import { Message } from '../../Models/Message';
import { MessageNotificationService } from '../../Services/message-notification.service';

@Component({
  selector: 'app-chat',
  standalone: false,
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewChecked {
  user!: UserDetails;
  receiverId!: number;
  messageText: string = '';
  messages: Message[] = [];
  private fetchMessagesInterval: any;
  receiver: string = "";
  
  scrollToBottomFlag: boolean = false;  // Flag to check if we need to scroll to bottom
  newMessageReceived: boolean = false;  // Flag to check if a new message has been received
  
  @ViewChild('messagesContainer') messagesContainer: any;  // Reference to the messages container

  constructor(
    private api: APIServiceService,
    private route: ActivatedRoute,
    private messageNotificationService: MessageNotificationService  // Inject the service
  ) { }

  ngOnInit(): void {
    // Retrieve the user from localStorage
    const userString = localStorage.getItem('user');
    this.user = userString ? JSON.parse(userString) : null;

    // Extract the 'id' parameter from the URL
    this.route.queryParams.subscribe(params => {
      this.receiverId = +params['id'];
      console.log('Receiver ID:', this.receiverId);

      // Fetch receiver details
      this.fetchReceiverDetails();

      // Fetch initial messages for the chat
      this.fetchMessages();

      // Set up periodic fetching of new messages every 5 seconds
      this.fetchMessagesInterval = setInterval(() => {
        this.fetchMessages();
      }, 5000); // Updated to 5 seconds for demonstration
    });
  }

  ngOnDestroy(): void {
    // Clean up the interval when the component is destroyed
    if (this.fetchMessagesInterval) {
      clearInterval(this.fetchMessagesInterval);
    }
  }

  ngAfterViewChecked(): void {
    if (this.scrollToBottomFlag) {
      this.scrollToBottom();  // Scroll to the bottom after view is updated
      this.scrollToBottomFlag = false;  // Reset the flag
    }
  }

  // fetchMessages(): void {
  //   this.api.GetAllMessages(this.user.user_id, this.receiverId).subscribe(
  //     (data: Message[]) => {
  //       // Check if new messages are different from existing messages
  //       const isNewMessage = this.messages.length !== data.length;
  //       if (isNewMessage) {
  //         this.messages = data;
  //         this.newMessageReceived = true; // Set flag to true if a new message is received
  //         this.scrollToBottomFlag = true; // Set flag to trigger scroll to bottom
  //       }
  //     },
  //     (error) => {
  //       console.error('Error fetching messages from user to receiver:', error);
  //     }
  //   );
  // }
  fetchMessages(): void {
  this.api.GetAllMessages(this.user.user_id, this.receiverId).subscribe(
    (data: Message[]) => {
      // Filter out messages with empty content
      const filteredMessages = data.filter(message => message.message.trim() !== '');
      const isNewMessage = this.messages.length !== filteredMessages.length;
      if (isNewMessage) {
        this.messages = filteredMessages;
        this.newMessageReceived = true; // Set flag to true if a new message is received
        this.scrollToBottomFlag = true; // Set flag to trigger scroll to bottom
      }
    },
    (error) => {
      console.error('Error fetching messages from user to receiver:', error);
    }
  );
}

  fetchReceiverDetails(): void {
    this.api.GetUserByID(this.receiverId).subscribe(
      (receiverDetails: UserDetails) => {
        this.receiver = receiverDetails.username; // Assuming the API returns a username
        console.log('Receiver Details:', receiverDetails);
      },
      (error) => {
        console.error('Error fetching receiver details:', error);
      }
    );
  }

  sendMessage(): void {
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
        this.messages.push(message); // Add the new message to the list
        this.messageText = ''; // Clear the input field
        this.newMessageReceived = true;  // Set flag to true if a new message was sent
        this.scrollToBottomFlag = true;  // Set flag to trigger scroll to bottom

        // Notify the SidebarComponent that a message has been sent
        this.messageNotificationService.notifyMessageSent();
      },
      (error) => {
        console.error('Error sending message:', error);
      }
    );
  }

  // Method to scroll to the bottom of the messages container
  scrollToBottom(): void {
    try {
      this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
    } catch (err) {
      console.error('Error scrolling to bottom:', err);
    }
  }
}
