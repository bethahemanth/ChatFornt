import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MessageNotificationService {
  notifyNewMessage(arg0: { senderId: number; receiverId: number; message: string; }) {
    throw new Error('Method not implemented.');
  }
  private messageSentSource = new Subject<void>();
  messageSent$ = this.messageSentSource.asObservable();

  // Method to notify components that a message has been sent
  notifyMessageSent() {
    this.messageSentSource.next();
  }
}
