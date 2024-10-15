import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms'; 
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {  HttpHeaders } from '@angular/common/http';
import { HeaderComponent } from "../header/header.component";
import { FooterComponent } from "../footer/footer.component";
import { AuthService } from '../auth.service';
declare var webkitSpeechRecognition: any;
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, HeaderComponent, FooterComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  isListening: boolean = false;
  transcript: string = '';
  interimTranscript: string = '';
  recognition: any;
  response: any;
  inactivityTimeout: any;
  isLoading: boolean = false;
  constructor(private router: Router, private http: HttpClient,private authService: AuthService){


  }
  ngOnInit(): void {
    const SpeechRecognition = (window as any).SpeechRecognition || webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();
    this.recognition.lang = 'en-US';
    this.recognition.interimResults = true;
    this.recognition.maxAlternatives = 1;

    this.recognition.onresult = (event: any) => {
      this.interimTranscript = '';
      let shouldStop = false;

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          const finalTranscript = event.results[i][0].transcript;
          this.transcript += finalTranscript + ' ';
          this.sendTranscriptToServer(this.transcript);

          if (finalTranscript.toLowerCase().includes("that's it") || finalTranscript.toLowerCase().includes("stop")) {
            shouldStop = true;
            

          }
        } else {
          this.interimTranscript += event.results[i][0].transcript;
        }
      }

      if (shouldStop) {
        this.stopListening();
      } else {
        this.resetInactivityTimer();
      }
    };

    this.recognition.onerror = (event: any) => {
      console.error(event.error);
      this.isListening = false;
      this.isLoading = false; // Hide loading indicator on error
    };

    this.recognition.onend = () => {
      if (this.isListening) {
        this.recognition.start(); // Restart recognition for continuous listening
      }
      this.isLoading = false; // Hide loading indicator when recognition ends
    };
  }

  toggleListening() {
    if (this.isListening) {
      this.stopListening();
    } else {
      this.startListening();
    }
  }

  startListening() {
    this.isListening = true;
    this.isLoading = true; // Show loading indicator
    this.recognition.start();
    this.resetInactivityTimer(); // Start inactivity timer
  }

  stopListening() {
    console.log('sto0ped')
    this.recognition.stop();
    this.isListening = false;

    clearTimeout(this.inactivityTimeout); // Clear inactivity timer
    this.isLoading = false; // Hide loading indicator
  }

  private resetInactivityTimer() {
    clearTimeout(this.inactivityTimeout);
    this.inactivityTimeout = setTimeout(() => {
      if (this.isListening) {
        this.stopListening();
        this.isListening=false
      }
    }, 3000); // Stop listening after 3 seconds of inactivity
  }
  private getToken(): string {
    return localStorage.getItem('token') || '';
  }
  sendTranscriptToServer(transcript: string) {
    const token = localStorage.getItem('token') || ''; // Get the token from localStorage

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`  // Add the token in the Authorization header
    });
    console.log({ input: transcript })
    this.http.post('http://127.0.0.1:8000/customer', { input: transcript }).subscribe({
      next: (response) => {
        console.log("api called ",response)
        console.log('Response received:', response);
        this.handleResponse(response);
      },
      error: (error) => {
        console.error('Error occurred:', error);
        // Display user-friendly error message or take other actions
        alert('Failed to send transcript. Please try again.');
      }
    });
  }
  
  
  handleResponse(response: any) {
    this.response = response;

    console.log("in handling",response.data)
    const { need } = response.data;
    
    switch (need) {
      case 'pledge':
        this.router.navigate(['/pledge'], { state: { data: response } });
        break;
      case 'redeem':
        this.router.navigate(['/redeem'], { state: { data: response } });
        break;
      case 'search':
        this.router.navigate(['/search'], { state: { data: response } });
        break;
      default:
        console.error('Invalid need type');
        break;
    }
  }
    openCamera() {
    // Create a video element to stream the camera feed
    const video = document.createElement('video');
    video.style.position = 'absolute';
    video.style.top = '50%';
    video.style.left = '50%';
    video.style.transform = 'translate(-50%, -50%)';
    video.style.width = '50%';
    video.style.height = 'auto';
    video.style.zIndex = '999'; // Make sure it's on top of other elements
    video.style.borderRadius='20px';
    video.style.border='2px #333 solid'
  
    // Create a canvas element to capture the image
    const canvas = document.createElement('canvas');
    canvas.style.display = 'none'; // Hide the canvas element
  
    // Create a button to capture the photo
    const captureButton = document.createElement('button');
    captureButton.innerHTML = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M21 3H3C1.89 3 1 3.89 1 5V19C1 20.11 1.89 21 3 21H21C22.11 21 23 20.11 23 19V5C23 3.89 22.11 3 21 3ZM21 19H3V5H21V19ZM12 8L16 12H13V14H11V12H8L12 8Z" fill="white"/>
    </svg>
  `; 
    captureButton.style.position = 'absolute';
    captureButton.style.bottom = '40px';
    captureButton.style.left = '50%';
    captureButton.style.transform = 'translateX(-50%)';
    captureButton.style.padding = '10px 20px';
    captureButton.style.backgroundColor = '#333';
    captureButton.style.color = '#ffffff';
    captureButton.style.border = 'none';
    captureButton.style.borderRadius = '5px';
    captureButton.style.cursor = 'pointer';
    captureButton.style.zIndex = '1000'; // Make sure it's on top of other elements
    captureButton.style.marginTop='20px'
    captureButton.style.fontFamily='cursive'
  
    // Append the video and capture button to the document body
    document.body.appendChild(video);
    document.body.appendChild(captureButton);
  
    // Get access to the camera
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
      .then((stream) => {
        // Set the video source to the camera stream
        video.srcObject = stream;
        video.play();
  
        // Once the video metadata is loaded
        video.onloadedmetadata = () => {
          // Show the video element
          video.style.display = 'block';
  
          // Set up the capture button click event
          captureButton.addEventListener('click', () => {
            // Create a canvas context
            const context = canvas.getContext('2d');
            if (!context) {
              console.error('Failed to get canvas context.');
              return;
            }
  
            // Set the canvas dimensions to match the video dimensions
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
  
            // Draw the video frame to the canvas
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
  
            // Convert the canvas to a blob
            canvas.toBlob((blob) => {
              if (blob) {
                // Create a File object from the Blob
                const file = new File([blob], 'photo.jpg', { type: 'image/jpeg' });
                this.handleFile(file);
              }
            }, 'image/jpeg');
  
            // Stop the camera stream
            stream.getTracks().forEach(track => track.stop());
  
            // Remove the video element and capture button
            video.remove();
            captureButton.remove();
          });
        };
      })
      .catch((error) => {
        console.error('Error accessing camera:', error);
      });
  }
    

  // Handle the selected file
  
    handleFile(file: File) {
      console.log('in handling file...........',file)
      const formData = new FormData();
      formData.append('file', file); // Ensure the field name matches the FastAPI parameter name 'file'
    

    
      // Send the POST request to upload the image to FastAPI
      this.http.post('http://127.0.0.1:8000/image', formData)
        .subscribe({
          next: (response: any) => {
            localStorage.setItem('responseData', JSON.stringify(response));
            console.log('Image upload response:', response);
            switch (response.need) {
              case 'pledge':
                this.router.navigate(['/pledge'], { state: { data: response } });
                break;
              case 'redeem':
                this.router.navigate(['/redeem'], { state: { data: response } });
                break;
              case 'search':
                this.router.navigate(['/search'], { state: { data: response } });
                break;
              default:
                console.error('Invalid need type');
                break;
            }  
          },
          error: (error) => {
            console.error('Error uploading image:', error);
          }
        });
    
  }
  parseJsonString(jsonString: string): any {
    let result: any = {
      need: null,
      customer_name: null,
      weight: null,
      article: null,
      amount: null,
      item_description: null,
      billnumber: {
        bill_serial: null,
        bill_number: null,
      },
      print_details: null,
    };

    try {
      // Parse JSON string into JavaScript object
      const jsonObject = JSON.parse(jsonString);

      // Extract fields using optional chaining and default values
      result.need = jsonObject.need ?? null;
      result.customer_name = jsonObject.customer_name ?? null;
      result.weight = jsonObject.weight ?? null;
      result.article = jsonObject.article ?? null;
      result.amount = jsonObject.amount ?? null;
      result.item_description = jsonObject.item_description ?? null;
      result.print_details = jsonObject.print_details ?? null;

      // Handle billnumber separately
      if (jsonObject.billnumber) {
        result.billnumber.bill_serial = jsonObject.billnumber.bill_serial ?? null;
        result.billnumber.bill_number = jsonObject.billnumber.bill_number ?? null;
      }

    } catch (error) {
      console.error('Invalid JSON format:', error);
    }
    console.log(result)
    this.handleResponse(result) ;
  }
  
  
      }

    

  
  
