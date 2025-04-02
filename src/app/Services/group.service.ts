import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Group } from '../Models/Group';  
import { APIServiceService } from './apiservice.service';

@Injectable({
  providedIn: 'root'
})
export class GroupService {
  private newGroupSubject = new Subject<Group>();  
  newGroupCreated$ = this.newGroupSubject.asObservable(); 

  constructor(private api: APIServiceService) {}

  createGroup(group: Group) {
    this.api.CreateGroup(group).subscribe(
      (createdGroup: Group) => {
        this.newGroupSubject.next(createdGroup);
      },
      (error) => {
        console.error('Error creating group:', error);
      }
    );
  }
}
