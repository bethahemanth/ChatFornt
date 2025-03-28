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
    const getUserUrl = `${this.url}/GetUser?id=${id}`;
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


}