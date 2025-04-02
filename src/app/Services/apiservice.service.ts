import { Message } from './../Models/Message';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class APIServiceService {

  private url: string = 'http://localhost:5195/api/User';

  constructor(private http: HttpClient) { }

  CustomAlert(message: string) {
    const notification = document.createElement('div');
    notification.className = 'custom-alert';
    notification.innerText = message;
 
    document.body.appendChild(notification);
    setTimeout(() => {
      notification.classList.add('fade-out');
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 500); 
    }, 2500);
  }

  ValidateUser(Email: string, password: string): Observable<any> {
    const validateUrl = `${this.url}/ValidateUser?Email=${Email}&Password=${password}`;
    return this.http.get<any>(validateUrl);
  }

  UploadProfilePicture(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ imageUrl: string }>('http://localhost:5195/api/User/UploadProfilePicture', formData);
  }

  GetLastestUserById(user_id: number): Observable<any> {
    const getUserUrl = `http://localhost:5195/api/User/GetLastestUserById?user_id=${user_id}`;
    
    return this.http.get<any>(getUserUrl).pipe(
      tap(response => console.log('User latest data', response)) // Print response using tap
    );
  }
  
  RegisterUser(user: any): Observable<any> {
    const registerUrl = `${this.url}/Register`;
    return this.http.post(registerUrl, user, { responseType: 'text' });
  }
  
  GetUser(email: string, password: string): Observable<any> {
    const getUserUrl = `${this.url}/GetUser?email=${email}&password=${password}`;
    return this.http.get<any>(getUserUrl);
  }

  GetUserById1(userId: number): Observable<any> {
    const url = `http://localhost:5195/api/User/GetUserById1?user_id=${userId}`;
    return this.http.get<any>(url).pipe(
      tap(response => console.log('Fetched user by ID:', response)) // Log the response for debugging
    );
  }
  
  GetUserByID(id: number): Observable<any> {
    return this.http.get<any>(`${this.url}/GetUserByID?id=${id}`).pipe(
      map((user: any) => {
        if (user.profile_picture) {
          user.profile_picture = `http://localhost:5195/uploads/${user.profile_picture}`;
        }
        return user;
      })
    );
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

  GetAllUsers(): Observable<any> {
    const getUsersUrl = "http://localhost:5195/api/User/GetAllUsers";
    return this.http.get<any>(getUsersUrl);
  }

  GetGroupsOfUser(id: number): Observable<any> {
    const getGroupsUrl = `http://localhost:5195/api/groups/groupid/${id}`;
    return this.http.get<any>(getGroupsUrl);
  }

  GetGroupInfo(id: number): Observable<any> {
    const getGroupUrl = `http://localhost:5195/api/groups/GetGroupInfo?id=${id}`;
    return this.http.get<any>(getGroupUrl);
  }

  GetMembersOfGroup(id: number): Observable<any> {
    const getMembersUrl = `http://localhost:5195/api/groups/members/${id}`;
    return this.http.get<any>(getMembersUrl);
  }

  GetGroupOwner(id: number): Observable<any> {
    const getGroupOwnerUrl = `http://localhost:5195/api/groups/owner/${id}`;
    return this.http.get<any>(getGroupOwnerUrl);
  }

  GetGroupMessages(id: number): Observable<any> {
    const getGroupMessagesUrl = `http://localhost:5195/api/messages/GetGroupMessage?id=${id}`;
    return this.http.get<any>(getGroupMessagesUrl);
  }

  GetGroupsOfOwner(id: number): Observable<any> {
    const getGroupsUrl = `http://localhost:5195/api/groups/groupsbyowner/${id}`;
    return this.http.get<any>(getGroupsUrl);
  }

  AddUserToGroup(groupId: number, userId: number): Observable<any> {
    const addUserUrl = `http://localhost:5195/api/groupmembers/insert`;
    const dto:any={
      group_id: groupId,
      user_id: userId,
      joined_at: new Date(),
    }
    return this.http.post(addUserUrl, dto, { responseType: 'text' });
  }
  
  DeleteUserFromGroup(groupId: number, userId: number): Observable<any> {
    const deleteUserUrl = `http://localhost:5195/api/groupmembers/delete/${userId}?group_id=${groupId}`;
    return this.http.delete(deleteUserUrl, { responseType: 'text' });
  }

  CreateGroup(group: any): Observable<any> {
    const createGroupUrl = `http://localhost:5195/api/groups`;
    return this.http.post(createGroupUrl, group, { responseType: 'text' });
  }

  DeleteGroup(groupId: number): Observable<any> {
    const deleteGroupUrl = `http://localhost:5195/api/groups/members/${groupId}`;
    return this.http.delete(deleteGroupUrl, { responseType: 'text' });
  }

  DeleteMessage(messageId: number): Observable<any> {
    const deleteMessageUrl = `http://localhost:5195/api/messages/delete/${messageId}`;
    return this.http.delete(deleteMessageUrl, { responseType: 'text' });
  }

  

}