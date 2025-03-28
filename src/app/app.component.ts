import { Component } from '@angular/core';
import { UserService } from './Services/user.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'ChatFornt';
  isLoggedIn: boolean=false;
  constructor(private userService: UserService) {
    // Subscribe to the validUser BehaviorSubject to track login status
    this.userService.validUser.subscribe((status) => {

      this.isLoggedIn = status;
    });
  }
}
