import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { APIServiceService } from '../../Services/apiservice.service';
import { UserDetails } from '../../Models/UserDetails';
import { Message } from '../../Models/Message';
@Component({
  selector: 'app-chat',
  standalone: false,
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export class ChatComponent implements OnInit {
  user!: UserDetails;
  receiverId!: number;
  messageText: string = '';
  messages: Message[] = []; // Array to store messages

  constructor(
    private api: APIServiceService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    // Retrieve the user from localStorage
    const userString = localStorage.getItem('user');
    this.user = userString ? JSON.parse(userString) : null;

    // Extract the 'id' parameter from the URL
    this.route.queryParams.subscribe(params => {
      this.receiverId = +params['id'];
      console.log('Receiver ID:', this.receiverId);

      // Fetch messages for the chat
      this.fetchMessages();
    });
  }

  fetchMessages(): void {
    this.messages=[];
    this.api.GetAllMessages(this.user.user_id, this.receiverId).subscribe(
      (data: Message[]) => {
        this.messages = data; // Initialize with the first set of messages
        console.log('Messages from user to receiver:', this.messages);
      },
      (error) => {
        console.error('Error fetching messages from user to receiver:', error);
      }
    );

    this.api.GetAllMessages(this.receiverId, this.user.user_id).subscribe(
      (data: Message[]) => {
        this.messages = [...this.messages, ...data]; // Append the second set of messages
        console.log('Messages after appending from receiver to user:', this.messages);
      },
      (error) => {
        console.error('Error fetching messages from receiver to user:', error);
      }
    );
  }

  sendMessage(): void {
    alert("sending message");
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
      },
      (error) => {
        console.error('Error sending message:', error);
      }
    );
    this.fetchMessages();
  }
}
