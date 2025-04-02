import { Component } from '@angular/core';
import { UserService } from '../Services/user.service';
import { APIServiceService } from '../Services/apiservice.service';
import { Router } from '@angular/router';
import { UserDetails } from '../Models/UserDetails';
import { HttpClient } from '@angular/common/http';

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
    profile_picture: '', // Stores uploaded image URL
    email: '',
    phone_number: '',
    password: ''
  };

  Email: string = '';
  password: string = '';
  nextPage: string = ''; // Example route after successful login
  maxDate: string;

  constructor(
    private userService: UserService,
    private apiService: APIServiceService,
    private router: Router,
    private http: HttpClient
  ) {
    const today = new Date();
    this.maxDate = today.toISOString().split('T')[0]; // Max date to prevent future DOB
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
  
    if (file) {
      this.apiService.UploadProfilePicture(file).subscribe(
        response => {
          // ✅ Fix: Ensure correct URL format
          if (response.imageUrl && !response.imageUrl.startsWith('http')) {
            this.registerData.profile_picture = `http://localhost:5195/uploads/${response.imageUrl}`;
          } else {
            this.registerData.profile_picture = response.imageUrl;
          }
  
          console.log("Uploaded Image URL:", this.registerData.profile_picture);
        },
        error => {
          console.error('Image upload failed:', error);
          this.apiService.CustomAlert('Failed to upload image. Please try again.');
        }
      );
    }
  }
  

  // ✅ Login Logic (Restored)
  onSubmit(): void {
    this.apiService.ValidateUser(this.Email, this.password).subscribe(
      (data: any) => {
        if (data) {
          this.apiService.CustomAlert("Login Successful");
          this.apiService.GetUser(this.Email, this.password).subscribe(
            (userRes: UserDetails) => {
              this.userService.setUser(userRes);
              console.log('User details:', userRes);
              this.router.navigate([this.nextPage]); // Redirect after login
            },
            (error) => {
              console.error('Error fetching user details:', error);
              this.apiService.CustomAlert('An error occurred while retrieving user details. Please try again.');
            }
          );
        } else {
          this.apiService.CustomAlert('Invalid Credentials');
        }
      },
      (error) => {
        console.error('Error during login validation:', error);
        this.apiService.CustomAlert('An error occurred. Please try again.');
      }
    );
  }

  // ✅ Register Logic (Restored)
  onRegister(): void {
    console.log('Registration Data:', this.registerData);
    this.apiService.RegisterUser(this.registerData).subscribe(
      () => {
        this.apiService.CustomAlert('Registration Successful!');
        this.router.navigate(['/login']);
      },
      (error) => {
        console.error('Error during registration:', error);
        this.apiService.CustomAlert('An error occurred during registration. Please try again.');
      }
    );
  }
}
