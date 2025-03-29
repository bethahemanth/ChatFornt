import { Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private hubConnection!: HubConnection;
  private messagesSubject = new BehaviorSubject<any[]>([]); // Observable to track messages
  messages$ = this.messagesSubject.asObservable(); // Export as observable

  constructor() { }

  public startConnection(userId: number, receiverId: number): void {
    this.hubConnection = new HubConnectionBuilder()
      .withUrl(`http://localhost:5195/chatHub`)
      .configureLogging(LogLevel.Information)
      .build();

    this.hubConnection.start().then(() => {
      console.log('SignalR connection established');
    }).catch(err => {
      console.error('Error starting connection: ', err);
    });

    // Listen for messages from the server
    this.hubConnection.on('ReceiveMessage', (sender: string, receiver: string, message: string) => {
      const newMessage = { sender, receiver, message };
      this.messagesSubject.next([...this.messagesSubject.getValue(), newMessage]);
    });
  }

  

  // Optionally, you can stop the connection when done
  public stopConnection(): void {
    this.hubConnection.stop();
  }
}
