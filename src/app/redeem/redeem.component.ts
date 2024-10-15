import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {ChangeDetectionStrategy} from '@angular/core';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {provideNativeDateAdapter} from '@angular/material/core';
import {MatIconModule} from '@angular/material/icon';
import { MatNativeDateModule } from '@angular/material/core';
import * as _moment from 'moment';
import {MatSelectModule} from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import {  AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import {default as _rollupMoment} from 'moment';
import { Bill } from '../pledge/Bill';
import { UserService } from '../user.service';
import { AuthInterceptor } from '../interceptors/auth.interceptor';
import { Customer } from '../add-customer/Customer';
import { HeaderComponent } from "../header/header.component";
import { FooterComponent } from "../footer/footer.component";
import { AuthService } from '../auth.service';
import { MatDialog } from '@angular/material/dialog';
import { RedeemCopyComponent } from '../redeem-copy/redeem-copy.component';
import { IndexedDbService } from '../indexed-db.service';
@Component({
  selector: 'app-redeem',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatIconModule,
    MatNativeDateModule,
    MatSelectModule,
    MatSnackBarModule,
    HeaderComponent,
    FooterComponent
],
  templateUrl: './redeem.component.html',
  styleUrl: './redeem.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush, 
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ],
})


export class RedeemComponent  {
  
    redeemform : FormGroup;
    bill!: Bill;
    nextBillRedemNo: number = 0; 
  data: any;
  error: any;
  foods= [
    {value: 'R', viewValue: 'Redeem'},
    {value: 'O', viewValue: 'Open'},
    {value: 'C', viewValue: 'Cancel'},
  ];
  isPhoto:boolean=false
  photoPreview: any;
  redeemStatus:any;
  billfound:boolean=false
    constructor(private fb: FormBuilder,private indexedDbService:IndexedDbService,private dialog: MatDialog, private route: ActivatedRoute, private router: Router, private http: HttpClient,private userService: UserService, private snackBar: MatSnackBar,private authService: AuthService ) {
      this.redeemform = this.fb.group({
        billSerial: ['', [Validators.required, Validators.maxLength(3)]],
        billNo: ['', [Validators.required, Validators.maxLength(7)]],
        redemptionStatus:["R"],
        redemptionDate: [new Date(),[Validators.required] ],
        redemptionTotal: ['',Validators.required],
        redemptionInterest: ['',Validators.required ],
        billRedemSerial: ['', Validators.required],
        billRedemNo: ['', Validators.required],
        receivedinterest: ['',Validators.required],
        interestinmonths:[]
        
      });
    }
    @ViewChild('myInput') myInputElement!: ElementRef;


    ngOnInit() {


      
    this.redeemform.patchValue({billRedemSerial:'A'})
    this.fetchNextBillNumbers();
    console.log('Router state:', history.state); 
    console.log('Data in PledgeComponent:', this.data); // Log the received data
  
    this.data = history.state.data;
    console.log('Data received in PledgeComponent:',  history.state.data);

    if (this.data) {
      this.patchFormValues(history.state.data.data);
    } else {
      console.error('No data received in PledgeComponent');
    }

  }
  formatDateToYYYYMMDD(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  }

  patchFormValues(data: any) {
    console.log('patch data :',data)
    console.log('patch data1 :',data.billnumber.bill_serial ,data.billnumber.bill_number)
    const a=data.billnumber.bill_number.replace(/\D/g, '');
    this.redeemform.patchValue({
      billSerial:data.billnumber.bill_serial,
      billNo:a

    })
    this.billFetch(a,data.billnumber.bill_serial)
  }

    fetchNextBillNumbers() {
      this.userService.getNextRedeemNumber().subscribe(
        response => {
          this.nextBillRedemNo = response.nextBillRedemNo;
          this.redeemform.patchValue({
            billRedemNo: this.nextBillRedemNo
          });
        },
        error => {
          console.error('Error fetching next bill numbers:', error);
        }
      );
    } 
    roiCalculator(roi: number,amount:number){
      return (roi*amount)/1200
    }
    billFetch(billNo: number, billSerial: string) {
      console.log('inbillfetch');
        
      this.userService.getBillByNumber(billNo,billSerial).subscribe(
        (resp) => {
          this.billfound=true
          this.bill = resp[0];
          this.retrievePhoto(String(this.bill.customer.customerid))

          console.log(resp);
          
          this.redeemStatus=this.bill.redemptionStatus
          this.redeemform.patchValue({           
            redemptionInterest:this.bill.redemptionInterest,
            interestinmonths:this.bill.interestinmonths,
            receivedinterest:this.bill.receivedinterest,
            redemptionTotal:this.bill.amount+this.bill.receivedinterest,
          })
          console.log('Response :',resp)
          this.photoPreview=resp[0].customer.imagePath
          if (this.photoPreview){
            this.isPhoto=true
          }
          let customer: Customer = this.bill.customer;
          customer.address = `${customer.street}, ${customer.district}, ${customer.country} - ${customer.pincode}`;
    
          console.log("Bill : " + this.bill);
          const a=this.redeemform.get("redemptionDate")?.value
          const startDate=this.formatDateToYYYYMMDD(a)
          console.log(startDate)
          const months=this.getMonthsBetweenDates(this.formatDateToYYYYMMDD(new Date (startDate)),this.formatDateToYYYYMMDD(new Date (resp[0].billDate)))
          const intrest =this.roiCalculator(resp[0].rateOfInterest,resp[0].amount)
        },
        (error) => {
          //this.redeemform;

          this.error = error;
          this.redeemform.patchValue({           
            redemptionInterest:'',
            interestinmonths:'',
            receivedinterest:'',
            redemptionTotal:'',
          })
          if (error.status === 404) {
            this.billfound=false
            this.redeemform.patchValue({           
              redemptionInterest:'',
              interestinmonths:'',
              receivedinterest:'',
              redemptionTotal:'',
            })
            console.log(error.message)
            this.snackBar.open('Bill not Found', 'Close', {  // Corrected here
              duration: 3000,
              verticalPosition: 'bottom',
            });
          } else {
            this.billfound=false
            this.redeemform.patchValue({           
              redemptionInterest:'',
              interestinmonths:'',
              receivedinterest:'',
              redemptionTotal:'',
            })
            //this.bill ='' ;
            console.error('Error fetching bill:', error);
            this.snackBar.open('Error fetching bill', 'Close', {
              duration: 3000,
              verticalPosition: 'bottom',
            });
          }
        }
      );
    }

    onFocusOut(event: FocusEvent): void {
      console.log('Input lost focus:', event.target);
      this.onBillSelected(event);
    }


    getMonthsBetweenDates(startDate: string, endDate: string): number {
      const start = new Date(startDate);
      const end = new Date(endDate);
    console.log('start=',start,'end=',end)
      const yearDifference = end.getFullYear() - start.getFullYear();
      const monthDifference = end.getMonth() - start.getMonth();
    
      console.log( 'Months=',yearDifference * 12 + monthDifference)
      return yearDifference * 12 + monthDifference;
    }
    transformDate(inputDate: string): string {
      // Create a new Date object from the input date string
      const date = new Date(inputDate);
      
      // Get the year, month, and day from the Date object
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
      const day = String(date.getDate()).padStart(2, '0');
  
      // Format the date as yyyy-mm-dd
      return `${year}-${month}-${day}`;
  }
  reset(){
    this.redeemform.patchValue({
      billNo:'',
      billSerial:'',
      redemptionInterest:'',
      receivedinterest:'',
      redemptionTotal:''
    })
    this.billfound=false


  }
  
      onRedemSubmit(redeemform:any) {
        console.log('inside submit')
      if (true) {
        console.log('Form submitted');
        console.log(this.redeemform.value);
        const date=this.transformDate(this.redeemform.get('redemptionDate')?.value)
        console.log(date)
        this.redeemform.patchValue({
          redemptionDate:date
        })
        
  
        const id = this.bill?.billSequence;    

        if (id !== undefined) {
        //const updateUrl = `http://localhost:8080/jewelbankersapi/bills/${id}`;
        this.userService.updateRedeemedBill(id, this.redeemform.value).subscribe(
          (response) =>{
            console.log('Updated successfully:', response);
            this.snackBar.open('Bill successfully redeemed', 'Close', {
              duration: 3000,
              verticalPosition: 'bottom',
            });
            this.redeemform.patchValue({
              billSerial:'',
              billNo:'',
            });

            const dialogRef = this.dialog.open(RedeemCopyComponent, {
              width: '200px',
            });
          
            dialogRef.afterClosed().subscribe(result => {
             // this.officecopy = result; // Save the result from the dialog
              //console.log('dialogue reply', this.officecopy); // Log the result
          
              if (result) {
                // Execute print logic if 'Yes' is selected
                this.generateAndDownloadPDF();
                // Add your print logic here
              } else {
                console.log('Print canceled.'); // Logic for 'No' can be handled here
              }
            });
            // After successful update, generate and download the PDF
        
          },
          (error) => {
            console.error('Error updating bill:', error);
            this.snackBar.open('Error redeeming bill', 'Close', { 
              duration: 3000,
              verticalPosition: 'bottom',
            }); 
          }
        );
      } else {
        console.error('Bill sequence ID is undefined');
      this.snackBar.open('Error: Bill sequence is missing', 'Close', {
        duration: 3000,
        verticalPosition: 'bottom',
      });
      }
     }
    }

    generateAndDownloadPDF() {
      const billSequence = this.bill?.billSequence; // Use the safe navigation operator to prevent undefined access
      const token = sessionStorage.getItem('accessToken');
    
      if (billSequence === undefined) {
        this.snackBar.open('Bill sequence is invalid', 'Close', {
          duration: 3000,
          verticalPosition: 'bottom',
        });
        return;
      }
    
      //const url = `http://localhost:8080/jewelbankersapi/bills/redeempdf/${billSequence}`;
      console.log("billSequence: " + billSequence);
      this.userService.downloadCustomerCopyPDF(billSequence).subscribe(
        (response: Blob) => {
          console.log('PDF Blob received:', response);
          const blob = new Blob([response], { type: 'application/pdf' });
          const blobUrl = window.URL.createObjectURL(blob);
      
          // Create an iframe to load the PDF and trigger print
          const iframe = document.createElement('iframe');
          iframe.style.visibility = 'hidden'; // Hide the iframe, but keep it in the DOM
          iframe.src = blobUrl;
      
          // Append the iframe to the document body
          document.body.appendChild(iframe);
      
          // Trigger the print dialog once the iframe is loaded
          iframe.onload = () => {
            iframe.contentWindow?.focus();
            iframe.contentWindow?.print();
          };
      
          // You can remove the iframe after printing manually if needed, but leave it for now to ensure print dialog shows.
        },
        error => {
          console.error('Error downloading the file for Customer copy', error);
          this.snackBar.open('Error generating Customer Copy', 'Close', {
            duration: 3000,
            verticalPosition: 'bottom',
          });
        }
      );
                  
}
  

    onBillSelected(event:Event) {
      console.log('onBillSelected called');

      const billNo = this.redeemform.get("billNo")?.value;
      const billSerial = this.redeemform.get("billSerial")?.value;
      

      this.billFetch(billNo,billSerial)

    }
    undoRedemption(){
      const billNo = this.redeemform.get("billNo")?.value;
      const billSerial = this.redeemform.get("billSerial")?.value;
      this.userService.deleteRedeemedBill(billSerial,billNo).subscribe((resp:any)=>{
        this.snackBar.open(resp, 'Close', {  // Corrected here
          duration: 3000,
          verticalPosition: 'bottom',

      })
      }
      )}

    saveRedemptionBill(bill: Bill) { 
      const body=JSON.stringify(bill);
      const headers  = new HttpHeaders({ 'Content-Type': 'application/json'})
      this.userService.saveRedemptionBill(bill).subscribe(
        (resp) => {
        },
        (error) => {
          console.error('Error fetching data:', error);
        }
      );
 }


 async retrievePhoto(customerId: string): Promise<void> {
  if (customerId) {
    console.log('Retrieving photo for customer ID:', customerId);

    try {
      // Attempt to get the photo from IndexedDB
      const photoData = await this.indexedDbService.getPhoto(customerId);
      console.log('Retrieved photo data:', photoData);

      if (photoData) {
        this.displayPhoto(photoData.photo); // Display the photo if found
      } else {
        //alert('No photo found for the given customer ID.');
      }
    } catch (error) {
      console.error('Error retrieving photo:', error);
      //alert('Failed to retrieve the photo. Please try again.');
    }
  } else {
    //alert('Please provide a valid customer ID.');
  }
}

// Display the photo in the UI
displayPhoto(photoBlob: Blob): void {
  this.isPhoto=true
  const url = URL.createObjectURL(photoBlob); // Create a URL for the Blob
  this.photoPreview = url; // Set the URL to the photoPreview variable
}


  // setRedeemption() {
  //   const bill: any = {
  //     redemptionDate: this.redeemform.get('redemptionDate')?.value != null?this.redeemform.get('redemptionDate')?.value:null,
  //     redemptionInterest: parseInt(this.redeemform.get('redemptionInterest')?.value),
  //     redemptionTotal: parseInt(this.redeemform.get('redemptionTotal')?.value),
  //     redemptionStatus: this.redeemform.get('redemptionStatus')?.value != null?this.redeemform.get('redemptionStatus')?.value:null,
  //     billRedemSerial: this.redeemform.get('billRedemSerial')?.value != null?this.redeemform.get('billRedemSerial')?.value:null,
  //     billRedemNo: this.nextBillRedemNo,
  //    }
  //    return bill;
  // }
}