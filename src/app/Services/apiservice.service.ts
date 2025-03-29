import { Message } from './../Models/Message';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class APIServiceService {

  private url: string = 'http://localhost:5195/api/User';

  constructor(private http: HttpClient) { }

  ValidateUser(Email: string, password: string): Observable<any> {
    const validateUrl = `${this.url}/ValidateUser?Email=${Email}&Password=${password}`;
    return this.http.get<any>(validateUrl);
  }
  GetUser(email: string, password: string): Observable<any> {
    const getUserUrl = `${this.url}/GetUser?email=${email}&password=${password}`;
    return this.http.get<any>(getUserUrl);
  }

  GetUserByID(id: number): Observable<any> {
    const getUserUrl = `http://localhost:5195/api/User/GetUserByID?id=${id}`;
    return this.http.get<any>(getUserUrl);
  }

  GetContact(id: number): Observable<any> {
    const getContactUrl = `http://localhost:5195/api/messages/GetContacts?id=${id}`;
    return this.http.get<any>(getContactUrl);
  }

  GetUsersSet(list:number[]){
    let str="";
    list.forEach(element => {
      str+="contacts="+String(element)+"&";
    });
    str = str.substring(0, str.length - 1);
    const getContactUrl = `http://localhost:5195/api/User/GetUsersSet?${str}`;
    return this.http.get<any>(getContactUrl);
  }

  SendMessage(message:Message): Observable<any> {
    const sendMessageUrl = `http://localhost:5195/api/messages/send`;
    return this.http.post(sendMessageUrl,message,{responseType: 'text'});
  }

  GetAllMessages(userId: number, receiverId: number): Observable<any> {
    const getMessagesUrl = `http://localhost:5195/api/messages/history?userId=${userId}&receiverId=${receiverId}`;
    return this.http.get<any>(getMessagesUrl);
  }

}