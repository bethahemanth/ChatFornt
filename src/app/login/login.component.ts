import { Component } from '@angular/core';
import { UserService } from '../Services/user.service';
import { APIServiceService } from '../Services/apiservice.service';
import { Router } from '@angular/router';
import { UserDetails } from '../Models/UserDetails';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  standalone: false,
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  validationErrors: { [key: string]: string } = {};

  isRegisterMode: boolean = false; // Toggle between login and register
  registerData = {
    user_id: 0,
    username: '',
    address: '',
    country: '',
    dateOfBirth: '',
    gender: '',
    profile_picture: '',
    email: '',
    phone_number: '',
    password: ''
  };

  
  onRegister(): void {
    console.log('Registration Data:', this.registerData);
    this.apiService.RegisterUser(this.registerData).subscribe(
      (response) => {
        alert('Registration Successful!');
        this.router.navigate(['/login']); 
      },
      (error) => {
        console.error('Error during registration:', error);
        alert('An error occurred during registration. Please try again.');
      }
    );
  }
    
  Email: string = '';
  password: string = '';
  nextPage: string = '/dashboard'; // Example route after successful login

  maxDate: string;

  constructor(
    private userService: UserService,
    private apiService: APIServiceService,
    private router: Router
  ) {
    const today = new Date();
    this.maxDate = today.toISOString().split('T')[0];
  }

  onSubmit(): void {
    this.apiService.ValidateUser(this.Email, this.password).subscribe(
      (data: any) => {
        if (data) {
          alert("Login Successful");
          this.apiService.GetUser(this.Email, this.password).subscribe(
            (userRes: UserDetails) => {
              this.userService.setUser(userRes);
              console.log('User details:', userRes);
            },
            (error) => {
              console.error('Error fetching user details:', error);
              alert('An error occurred while retrieving user details. Please try again.');
            }
          );
        } else {
          alert('Invalid Credentials');
        }
      },
      (error) => {
        console.error('Error during login validation:', error);
        alert('An error occurred. Please try again.');
      }
    );
  }
}
