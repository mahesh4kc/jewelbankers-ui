import { Component, ElementRef, NgModule, OnInit,Renderer2, ViewChild, ViewEncapsulation } from '@angular/core';
import {ChangeDetectionStrategy} from '@angular/core';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {provideNativeDateAdapter} from '@angular/material/core';
import {MatIconModule} from '@angular/material/icon';
import { MatNativeDateModule } from '@angular/material/core';
import {MatSelectModule} from '@angular/material/select';
import { FormGroupDirective, NgForm, ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule, JsonPipe } from '@angular/common';
import {Observable, of} from 'rxjs';
import {catchError, debounceTime, filter, map, startWith, switchMap} from 'rxjs/operators';
import {AsyncPipe} from '@angular/common';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {default as _rollupMoment} from 'moment';
import { Injectable } from '@angular/core';
import { HTTP_INTERCEPTORS, HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { Bill } from './Bill';
import { get } from 'http';
import { BillDetail } from './BillDetails';
import { Customer } from '../add-customer/Customer';
import { AuthInterceptor } from '../interceptors/auth.interceptor';
import { UserService } from '../user.service';
import {  AfterViewInit  } from '@angular/core';
import { jsPDF } from 'jspdf';
import { prototype } from 'events';
import { _setDisabled } from 'ag-grid-community';
import { HeaderComponent } from "../header/header.component";
import { FooterComponent } from "../footer/footer.component";
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Settings } from '../setting/setting';
import { AuthGuard } from '../auth.guard';
import { AuthService } from '../auth.service';
import { error } from 'console';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { RedeemCopyComponent } from '../redeem-copy/redeem-copy.component';
import { CustomerCopyComponent } from '../customer-copy/customer-copy.component';
import { IndexedDbService } from '../indexed-db.service';

@Component({
  selector: 'app-pledge',
  standalone: true,
  imports: [MatAutocompleteModule,MatSnackBarModule, HttpClientModule, AsyncPipe, CommonModule, RouterModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatDatepickerModule, MatIconModule, MatNativeDateModule, MatSelectModule, JsonPipe, HeaderComponent, FooterComponent],
  templateUrl: './pledge.component.html',
  styleUrl: './pledge.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush, 
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ],
  
})



  export class PledgeComponent implements OnInit,AfterViewInit {
  customers: Customer[] | undefined;
  officecopy: any;
  selectFiles: File | Blob | '' = ''
  selectedFile: any;
  
printForm() {
throw new Error('Method not implemented.');
}


    
      billform : FormGroup;
      isBillSerialDisabled: boolean = false;
      selectedCustomer: Customer | undefined;
      isSuccess: boolean = false;
      alertMessage: string = "";
      nextBillNo: number = 0;  // New variable to store the next bill number
      savedBillSequence: number = 0;
      photoPreview: string | ArrayBuffer | null = null;
      @ViewChild('myInput') myInputElement!: ElementRef;
      selectedCustomerarr:Customer[]|undefined
    silverROI: any;
    goldROI5K: any;
    goldROI10K: any;
    goldROI15K: any;
    goldROI20K: any;
    goldROI100Kplus: any;
    goldROI100K: any;
    goldROI50K: any;
    dataSource: any;
    setting: any; 
    productOptions:any
    productTypes: ProductTypes[] = [];
    products: any;
    ifOthers:boolean=false
    productValue:any
    data: any;

      constructor(private fb: FormBuilder,private indexedDbService:IndexedDbService,private dialog: MatDialog, private route: ActivatedRoute ,private router: Router,private http:HttpClient,private renderer: Renderer2,private userService: UserService,private snackBar:MatSnackBar,private authService: AuthService) {

  //[Validators.required,Validators.maxLength(31),Validators.minLength(3)]
        this.billform = this.fb.group({
          billSerial: ['', [Validators.maxLength(3)]],
          billNo: ['', [ Validators.maxLength(5),Validators.required]],
          customerName: [''],
          customerid: [{ value: '', disabled: true }, ],
          Address: ['',],
          fullAddress: ['',  [Validators.maxLength(150),Validators.required]],
          productTypeNo: [, [Validators.required]],
          amount: ['', [ Validators.maxLength(8),Validators.required]],
          grams: ['', [ Validators.maxLength(7),Validators.required]],
          productQuantity: ['', [ Validators.required,Validators.maxLength(3)]],
          productDescription: ['' ,[ Validators.maxLength(40),Validators.required,Validators.minLength(5)] ],
          presentValue: ['', [ Validators.maxLength(8)]],
          rateOfInterest: ['', [ Validators.required,Validators.maxLength(6)]],
          billDate: [new Date(), []],
          AmountInWords: ['', [ ]],
          totalgive: [''],
          interstpledge: [''],
          phoneno:[''],
          oldbillserialno:[''],
          image_path: [null],
          proofDetails:['',Validators.maxLength(40)],
          proofType:['A'],
          mailid:[''],
          newProduct:[''],
          newROI:[''],
          comments:[""],  
          monthlyIncome:[""]        
        });
        
        

        
      }
      isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
        const isSubmitted = form && form.submitted;
        return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
      }
      trackByFn(index: number, item: any): any {
        return item.id; // or whatever unique identifier your options have
      }
      
    
      transcript: string = '';
      myControl = new FormControl('');
      phoneControl = new FormControl();
      filteredPhoneOptions!: Observable<string[]>;      
      options: Customer[] = [];
      filteredOptions: Observable<string[]>|undefined ;
      ngAfterViewInit() {
        this.myInputElement.nativeElement.focus();
      }
    
      // Mock a file from a Blob or from base64 (for testing purposes)
createFileFromPath(filePath: string): File {
  // Simulating the creation of a file object for demo
  const fileName = filePath.split('\\').pop() || 'Screenshot 2024-09-22 224317.png';
  const fileType = 'image/png';

  // You can replace the Blob content with your actual file content or base64 string
  const blob = new Blob([''], { type: fileType }); // Empty blob, replace with actual data
  return new File([blob], fileName, { type: fileType });
}

createFileList(file: File): void {
  const dataTransfer = new DataTransfer();
  dataTransfer.items.add(file);
  const fileList = dataTransfer.files;
  //this.selectFiles=fileList

  console.log('Mock FileList:', fileList);

  const reader = new FileReader();
  
  // Read the file as a Data URL (base64)
  reader.onload = () => {
    this.photoPreview = reader.result as string; // Set the photo preview as a base64 URL
    console.log('Image preview:', this.photoPreview); // Log the preview44
  };  
  
  reader.readAsDataURL(file); // This will trigger the 'onload' callback above
  
  // Patch the form with the file name
  this.billform.patchValue({
    image_path: file.name
  });
  this.selectFiles=file
  console.log('this is sleceted files ',file)

  console.log(this.billform); // Log form to verify
}



ngOnInit() {
  this.fetchNextBillNumbers();





  const storedData = localStorage.getItem('responseData');
  if (storedData) {
      const parsedData = JSON.parse(storedData);
      this.patcheValues(parsedData)
      console.log("Parsed response data:", parsedData);  // This will show the object
  } else {
      console.log('No response data found in local storage.');
  }


      this.filteredPhoneOptions = this.phoneControl.valueChanges.pipe(
      debounceTime(300),
      switchMap(value => this._filterByPhone(value)) // Call the API filtering function
    );
        this.getCustomerByphone()
        this.fetchProductTypes();
         //const filePath = 'C:\\Users\\deepa\\OneDrive\\Pictures\\Screenshots\\Screenshot 2024-09-22 224317.png';
         
  // Create a mock file (replace with actual file logic)
  //const file = this.createFileFromPath(filePath);
  
  // Call the method to handle the file preview
  //this.createFileList(file);
  this.data = history.state?.data;

  if (this.data) {
    console.log('Data received in PledgeComponent:', this.data);
    this.patchFormValues(this.data);
  } else {
    console.error('No data received in PledgeComponent');
  }

        
        this.filteredOptions = this.myControl.valueChanges.pipe(
          startWith(''),
          switchMap(value => this._filter(value || '')), // switchMap will flatten the Observable<Observable<string[]>> to Observable<string[]>
        );
        
        this.billform.get('rateOfInterest')!.valueChanges.subscribe(() => this.calculateIntrestPledgeAndTotalGive());
        this.billform.get('amount')!.valueChanges.subscribe(() => this.calculateIntrestPledgeAndTotalGive());
        this.billform.get('amount')!.valueChanges.subscribe(() => this.roiacess());
        this.billform.get('productTypeNo')!.valueChanges.subscribe(() => this.roiacess());

        

        this.userService.getSettings().subscribe(
        list => {
          this.setting=list;
         // console.log("seeting silver "+this.userService.getMySettingParamValueById("CURRENT_SERIAL",this.setting));
          this.silverROI=this.userService.getMySettingParamValueById("SILVER_INTREST",this.setting);

          //this.silverROI=this.setting.getParamValueById("CURRENT_SERIAL",this.setting);
          this.goldROI5K=this.userService.getMySettingParamValueById("GOLD_INTREST_LESS_THAN_5000",this.setting);
          this.goldROI10K=this.userService.getMySettingParamValueById("GOLD_INTREST_LESS_THAN_10000",this.setting);
          this.goldROI20K=this.userService.getMySettingParamValueById("GOLD_INTREST_LESS_THAN_20000",this.setting);
          this.goldROI50K=this.userService.getMySettingParamValueById("GOLD_INTREST_LESS_THAN_50000",this.setting);
          this.goldROI100K=this.userService.getMySettingParamValueById("GOLD_INTREST_LESS_THAN_100000",this.setting);
          this.goldROI100Kplus=this.userService.getMySettingParamValueById("GOLD_INTREST_MORE_THAN_100000",this.setting);
          this.billform.patchValue({
            billSerial:this.userService.getMySettingParamValueById("CURRENT_SERIAL",this.setting),
            monthlyIncome:this.userService.getMySettingParamValueById("MONTHLY_INCOME",this.setting)
          })
          
        }); 
          }
    
    fetchProductTypes(){
      this.userService.getProductTypes().subscribe((resp:any)=>{
             console.log('here is product details', )
             this.productOptions=resp;
             this.productTypes = resp;
             this.products =  resp.map((item: { productTypeCode: any; }) => item.productTypeCode);
             this.billform.patchValue({
              productTypeNo:this.getProductTypeNo("GOLD")
            })
     // goldProducts will now contain only the items with productTypeCode 'GOLD'
           })
   }

    private _filter(value: string): Observable<string[]> {
      const input = value.toLowerCase();
      if (input==''){
        let filteredOptions: string[] = [];
        return of(filteredOptions);
      }
      
      // Fetch filtered customer records from the API
      return this.userService.getCustomersByName(input).pipe(
        map((resp: Customer[]) => {
          console.log('see here.....',resp)
          let filteredOptions: string[] = [];
          this.options=resp
    
          if (resp && resp.length > 0) {
            // Extract customer names from the API response if available
            const customerNames = resp.map(customer => customer.customerName?.toLowerCase() || '');
    
            // Filter the available customer options based on the input
            filteredOptions = customerNames.filter(option => option.includes(input));
          }
    
          // If no customers are found or no matches, just add the user's input
          if (filteredOptions.length === 0 && value) {
            filteredOptions.push(value);
          }
    
          // Return filtered options
          return filteredOptions;
        }),

      );
    }        
      getBillDetails(){
        const billDetail : BillDetail = {
          productNo: (this.billform.get('productNo')?.value),
          productDescription: (this.billform.get('productDescription')?.value) ,
          productQuantity: (this.billform.get('productQuantity')?.value),
        };
        const billDetails:any[] = new Array;
        billDetails.push(billDetail);    

        return billDetails;
      }
      async storePhoto(customerId: string, selectedFile: Blob): Promise<void> {
        console.log('Attempting to store photo...');
      
        // Validate inputs
        if (customerId && selectedFile) {
          console.log('Storing photo with details:', { customerId, selectedFile });
      
          try {
            // Attempt to add the photo to IndexedDB
            await this.indexedDbService.addPhoto(customerId, selectedFile);
            alert('Photo stored successfully!');
          } catch (error) {
            console.error('Error storing photo:', error);
            alert('Failed to store the photo. Please try again.');
          }
        } else {
          alert('Please provide a valid customer ID and select a photo.');
        }
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
              console.log('No photo found for the given customer ID. You may need to upload a new photo.');
              // Optionally, prompt the user to upload a new photo here
            }
          } catch (error) {
            console.error('Error retrieving photo:', error);
            alert('Failed to retrieve the photo. Please try again.');
          }
        } else {
          alert('Please provide a valid customer ID.');
        }
      }
      
      // Update or add a new photo
      async updatePhoto(customerId: string, file: Blob): Promise<void> {
        await this.indexedDbService.addOrUpdatePhoto(customerId, file);
        console.log('Photo updated successfully');
      }
      
      // Display the photo in the UI
      displayPhoto(photoBlob: Blob): void {
        const url = URL.createObjectURL(photoBlob); // Create a URL for the Blob
        this.photoPreview = url; // Set the URL to the photoPreview variable
      }
      

      
      
      
      
      
      patcheValues(input:any){
        this.billform.patchValue({
          amount:input?.amount,
          productDescription:input?.item_description,
          grams:input?.weight,
          customerName:input?.customer_name,
        })
        // this.billform.get('customerName')?.setValue(input.customer_name)
        localStorage.removeItem('responseData');
        // this.calculateIntrestPledgeAndTotalGive()
        // this.roiacess()
        //this.updateAmountInWords()


      }
      private _filterByPhone(phone: string): Observable<string[]> {
        const input = phone.toLowerCase();
        console.log('phone number entered', phone);
      
        if (input === '') {
          // If input is empty, return an empty array
          return of([]);
        }
      
        // Fetch filtered customer records by phone from the API
        return this.userService.getCustomerByPhone(input).pipe(
          map((resp: any[]) => {
            let filteredOptions: string[] = [];
            this.selectedCustomerarr=resp
            console.log(this.selectedCustomerarr);
      
            if (resp && resp.length > 0) {
              // Extract phone numbers and customer names, then format them as "phonenumber : customername"
              const formattedOptions = resp.map(customer => {
                const phoneNumber = (customer.phoneno || '').toString(); // Convert phone number to string
                const customerName = customer.customerName || ''; // Get customer name or an empty string
                
                // Return formatted string "phonenumber : customername"
                return `${phoneNumber} : ${customerName}`;
              });
      
              // Filter based on whether the formatted option includes the input
              filteredOptions = formattedOptions.filter(option => option.includes(input));
            }
      
            // If no formatted options are found, push the user's input as an option
            if (filteredOptions.length === 0 && phone) {
              filteredOptions.push(phone);
            }
      
            return filteredOptions;
          })
        );
      }
      private _extractPhoneNumber(formattedString: string): string {
        // Regular expression to match phone numbers (digits before the colon)
        const match = formattedString.match(/^(\d+)\s*:/);
        
        // If a match is found, return the phone number part
        return match ? match[1] : '';
      }
      private searchByPhoneNumber(phone: number): Customer | undefined {
        if (!this.selectedCustomerarr || this.selectedCustomerarr.length === 0) {
          console.log('Customer array is empty or undefined.');
          return undefined; // Explicitly return undefined if the array is empty or undefined
        }
      
        // Search for the customer with the matching phone number
        const foundCustomer = this.selectedCustomerarr.find(customer => {
          return customer.phoneno === phone;  // Ensure that the phone number comparison is done as a number
        });
      
        if (foundCustomer) {
          console.log(`Found customer: ${foundCustomer.customerName}, Phone: ${foundCustomer.phoneno}`);
          return foundCustomer;  // Return the found customer
        } else {
          console.log('No customer found with the provided phone number.');
          return undefined;  // Explicitly return undefined when no customer is found
        }
      }
            
        onPhoneSelected(phoneNumber: string) {
        console.log('Phone number selected:', this.selectedCustomerarr);
        const phoneNumberAsString = this._extractPhoneNumber(phoneNumber).toString();
        const phoneNumberAsNumber = Number(phoneNumberAsString); // Convert string to number
        const customer=this.searchByPhoneNumber(phoneNumberAsNumber)
        console.log(customer)

        if((customer?.customerName||this.billform.get('customerName')?.value) && !this.iscs){
          this.billform.patchValue({
            mailid:customer?.mailid,
            customerName:customer?.customerName,
            fullAddress:customer?.address,
            proofType:customer?.proofType,
            proofDetails:customer?.proofDetails,
            phoneno:phoneNumberAsString,
            customerid:customer?.customerid
          })
          console.log('customer id passed',String(customer?.customerid))
          
          if(!customer?.customerName){
            this.billform.patchValue({
              customerName:customer?.customerName,
            })
          }
        }
        this.retrievePhoto(String(customer?.customerid))

        


              }
      // trackByFn(index: number, item: any) {
      //   return index;
      // }

      getCustomer(){
        const customer : Customer = {
          "customerid": parseInt(this.billform.get('customerid')?.value),
          "area": this.billform.get('area')?.value,
          "mailid": this.billform.get('mailid')?.value,
          "state": this.billform.get('state')?.value,
          "pincode": this.billform.get('pincode')?.value,
          "customerName": this.myControl.value,
          "street": this.billform.get('street')?.value,
          "district": this.billform.get('district')?.value,
          "country": this.billform.get('country')?.value,
          "relationship": null,
          "relationshipname": null,
          "phoneno": this.billform.get('phoneno')?.value,
          "mobileno": this.billform.get('mobileno')?.value,
          "address": this.billform.get('fullAddress')?.value, // we are getting from full address and sending to payload
          "proofType": this.billform.get('proofType')?.value,
          "proofDetails": this.billform.get('proofDetails')?.value,
          imagePath: this.billform.get('image_path')?.value,
          "fullAddress": this.billform.get('fullAddress')?.value,
          photo: undefined
        }
        return customer;
      }

      fetchNextBillNumbers() {
        // Fetch the next bill number from the backend
        this.userService.getNextBillNumber().subscribe(
          response => {
            console.log(response)
            this.nextBillNo = response.nextBillNo;
            this.billform.patchValue({
              billNo: this.nextBillNo,
            });
          },
          error => {
            console.error('Error fetching next bill numbers:', error);
          }
        );
      }

      patchFormValues(data: any) {
        this.data=data
        console.log('data recieved in patch values',data)
        console.log('name recived',data.customer_name)
        this.billform.patchValue({
          customerName: data.customer_name,
          amount: data.amount ,
          grams: data.weight || '',
          productDescription: data.item_description || '',
          productTypeNo:data.article||'',
        });
        this.data=null

        
      }


      createCustomer(print:boolean){
        
        if (true) {
          this.billform.patchValue({
            id:null,
          })
        const bill: Bill = {
          // billSequence: parseInt(this.billform.get('billSequence')?.value),
          amount: parseInt(this.billform.get('amount')?.value),
          billSerial: String(this.billform.get('billSerial')?.value),
          billDate: this.formatDateToYYYYMMDD(this.billform.get('billDate')?.value),
          billNo: parseInt(this.billform.get('billNo')?.value),
          careOf: this.billform.get('careOf')?.value != null ? this.billform.get('careOf')?.value : null,
          productTypeNo: parseInt(this.billform.get('productTypeNo')?.value),
          amountInWords: String(this.billform.get('AmountInWords')?.value),
          presentValue: parseInt(this.billform.get('presentValue')?.value),
          grams: parseInt(this.billform.get('grams')?.value),
          monthlyIncome: parseInt(this.billform.get('monthlyIncome')?.value),
          redemptionDate: this.billform.get('redemptionDate')?.value != null ? this.billform.get('redemptionDate')?.value : null,
          redemptionInterest: parseInt(this.billform.get('redemptionInterest')?.value),
          redemptionTotal: parseInt(this.billform.get('redemptionTotal')?.value),
          redemptionStatus: this.billform.get('redemptionStatus')?.value != null ? this.billform.get('redemptionStatus')?.value : 'O',
          billRedemSerial: this.billform.get('billRedemSerial')?.value != null ? this.billform.get('billRedemSerial')?.value : null,
          billRedemNo: parseInt(this.billform.get('billRedemNo')?.value),
          comments: this.billform.get('comments')?.value != null ? this.billform.get('comments')?.value : null,
          receivedinterest: this.billform.get('receivedinterest')?.value != null ? this.billform.get('receivedinterest')?.value : 0,
          oldbillserialno: String(this.billform.get('oldbillserialno')?.value),
          interestinmonths: this.billform.get('interestinmonths')?.value != null ? this.billform.get('interestinmonths')?.value : null,
         // comments:this.billform.get
          customer: this.getCustomer(),
          rateOfInterest: parseInt(this.billform.get('rateOfInterest')?.value),
          image_path: this.billform.get('image_path')?.value,
          billDetails: this.getBillDetails(),
        }
        

        const billDetails : BillDetail = {
          productNo: parseInt(this.billform.get('productNo')?.value),
          productDescription:this.billform.get('productDescription')?.value,
          productQuantity: parseInt(this.billform.get('productQuantity')?.value),
        };

        


        this.saveCustomer(bill,print);
        this.isSuccess = true;
        
      }
      }
      onSubmit(form:any,print:boolean=false) {
       this.createCustomer(print);
      //  this.resetForm()
    
  }
  submitPrint(form:any,print:boolean=false) {
    this.createCustomer(print);
    // this.resetForm();
 
}
  IsNull(value:string){
    return value != null ? value : "";
  }
  IsIntNull(value:number){
    return value != null && value > 0 ? value : "";
  }

    formatDateToYYYYMMDD(date: Date): string {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
      const day = String(date.getDate()).padStart(2, '0');
      
      return `${year}-${month}-${day}`;
    }
    
saveCustomer(bill: Bill, _print: boolean = false) {
  const body = JSON.stringify(bill);
  const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
  const body1 = {
    "productTypeCode": this.billform.get('newProduct'),
    "productTypeDescription": this.billform.get('newProduct'),
    "rateOfInterest": this.billform.get('newROI')
  };
  // body1
  // this.userService.postProductTypes(body1).subscribe((resp: any) => {
  //   console.log(resp);
  // });
  const photoFile = this.selectFiles ; // e.g., from a file input event
  console.log('check this photo file ..........',photoFile)
  // this.userService.createCustomer(bill, photoFile)
  // .subscribe(response => {
  //   console.log('Customer created successfully', response);
  // }, error => {
  //   console.error('Error creating customer', error);
  // });
  
  if (true) {


    const formData = new FormData();
    
    formData.append('bill', new Blob([JSON.stringify(bill)], { type: 'application/json' }));
    formData.append('photo', this.selectedFile);
    if(this.selectFiles){
      this.storePhoto(String(bill.customer.customerid), this.selectFiles);
    }



  
  
   this.userService.createBill( formData).subscribe(
    (response) => {
      console.log('Updated successfully:', response);
      const bill1: any = response;

      // Display success message for pledging
      this.snackBar.open('Bill successfully Pledged', 'Close', {
        duration: 3000,
        verticalPosition: 'bottom',
      });


        if (_print == true) {
          // Open confirmation dialog for printing customer copy
const dialogRef = this.dialog.open(ConfirmDialogComponent, {
  width: '200px',
});

console.log('dialogue reply', this.officecopy);

dialogRef.afterClosed().subscribe(result => {
  this.officecopy = result; // Save the result from the first dialog
  console.log('dialogue reply', this.officecopy); // Log the result

  if (result) {
    const billSequence=bill1.billSequence
    // Proceed to generate the bill PDF if 'Yes' was clicked in the first dialog
    this.userService.generateBillPdf(billSequence).subscribe(
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

  } else {
    console.log('Print canceled.'); // Logic for 'No' can be handled here
  }
});

// Function to handle the second dialog for office copy
const openOfficeCopyDialog = () => {
  const dialogRef1 = this.dialog.open(CustomerCopyComponent, {
    width: '200px',
  });

  dialogRef1.afterClosed().subscribe(result => {
    this.officecopy = result; // Save the result from the second dialog
    console.log('dialogue reply for office copy', this.officecopy); // Log the result

    if (result) {
      // Proceed to download office copy PDF if 'Yes' was clicked in the second dialog
      this.userService.downloadCustomerCopyPDF(bill1.billSequence).subscribe(
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
    } else {
      console.log('Office copy print canceled.');
    }
  });
};


          
  }
      
      // Fetch next bill numbers after printing
      this.fetchNextBillNumbers();
      //this.resetForm()
    },
    (error) => {
      console.error('Error updating bill:', error);
      this.snackBar.open('Error Pledging bill', 'Close', {
        duration: 3000,
        verticalPosition: 'bottom',
      });
    }
  );
}
}
  
    displayFn(customer: Customer): string {
      return customer && customer.customerName ? customer.customerName : '';
    }   
    getCustomerByphone(){
      const a='988476096'
      const phone=this.billform.get('phoneno')?.value
      this.userService.getCustomerByPhone(a).subscribe((resp:any)=>{
        console.log('bhaskar recoed on search:',resp)
      },
      (error) => {
        console.error('Error occurred while creating the bill:', error);
    
        // Handle specific error cases based on status code or message
        if (error.status === 400) {
          this.snackBar.open('Invalid Phone Number. Please check your Number.', 'Close', {
            duration: 3000,
            verticalPosition: 'bottom',
          });
        } else if (error.status === 500) {
          this.snackBar.open('Server error occurred. Please try again later.', 'Close', {
            duration: 3000,
            verticalPosition: 'bottom',
          });
        } else {
          this.snackBar.open('An unknown error occurred. Please contact support.', 'Close', {
            duration: 3000,
            verticalPosition: 'bottom',
          });
        }
      }
    );
    }
    iscs:boolean=false
    customerPhoto:any
    onCustomerSelected(customerName: string) {

      console.log('options',this.options)
      const selectedCustomer = this.options.find(option => option.customerName?.toLowerCase() === customerName.toLowerCase());
      console.log('selectedcustomer',selectedCustomer)
      if (selectedCustomer) {
        console.log("selected");
        const fullAddress1 = selectedCustomer.fullAddress;
       // const fullAddress1 = `${selectedCustomer.area}, ${selectedCustomer.street}, ${selectedCustomer.district}, ${selectedCustomer.country} - ${selectedCustomer.pincode}`;
        console.log("fullAddress: ",fullAddress1)
        this.billform.patchValue({ fullAddress: fullAddress1 });
        this.billform.patchValue({customerName:selectedCustomer.customerName});
        this.billform.patchValue({ customerid: selectedCustomer.customerid });
        this.billform.patchValue({ 
          // phoneno: selectedCustomer.phoneno ,
          proofType:selectedCustomer.proofType,
          mailid:selectedCustomer.mailid,
          proofDetails:selectedCustomer.proofDetails,

        });
        this.iscs=true
        if(selectedCustomer.phoneno==0 ||selectedCustomer.phoneno==''){

        }
        else{
          this.billform.patchValue({
            phoneno: selectedCustomer.phoneno
          })

        }

        //this.photoPreview=selectedCustomer.imagePath
        this.retrievePhoto(String(selectedCustomer.customerid))

      
      }
    }
updateAmountInWords(event: any) {
  const inputElement = event.target as HTMLInputElement;
  const amount = inputElement.value;

  if (amount) {
    const amountValue = parseFloat(amount); // Convert input value to a number if needed
    const amountWords = this.convertAmountToWords(amountValue);
    this.billform.patchValue({ AmountInWords: amountWords });
  } else {
    this.billform.patchValue({ AmountInWords: '' }); // Handle case when amount is emonsubpty or invalid
  }
}

convertAmountToWords(amount: number): string {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const teens = ['Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', 'Ten', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  if (amount === 0) {
    return 'Zero Rupees Only';
  }

  if (amount >= 100000000) {  // Check if amount exceeds 10 crore limit
    return 'Amount exceeds 10 Crore';
  }

  let words = '';

  function convertLessThanHundred(number: number): string {
    if (number < 10) {
      return ones[number];
    } else if (number === 10) {  // Handle the case for 10 separately
      return tens[1];  // "Ten"
    } else if (number < 20) {
      return teens[number - 11];
    } else {
      const tensDigit = Math.floor(number / 10);
      const unitDigit = number % 10;
      return tens[tensDigit] + (unitDigit ? ' ' + ones[unitDigit] : '');
    }
  }

  // Convert Crores
  if (amount >= 10000000) {
    const crore = Math.floor(amount / 10000000);
    words += convertLessThanHundred(crore) + ' Crore ';
    amount %= 10000000;
  }

  // Convert Lakhs
  if (amount >= 100000) {
    const lakh = Math.floor(amount / 100000);
    words += convertLessThanHundred(lakh) + ' Lakh ';
    amount %= 100000;
  }

  // Convert Thousands
  if (amount >= 1000) {
    const thousand = Math.floor(amount / 1000);
    words += convertLessThanHundred(thousand) + ' Thousand ';
    amount %= 1000;
  }

  // Convert Hundreds
  if (amount >= 100) {
    const hundred = Math.floor(amount / 100);
    words += convertLessThanHundred(hundred) + ' Hundred ';
    amount %= 100;
  }

  // Convert Tens and Units
  if (amount > 0) {
    words += convertLessThanHundred(amount);
  }

  words += ' Rupees Only';
  return words.trim();
}
presentvalue(){
      const wei=this.billform.get('grams')!.value;
      const amo=this.billform.get('amount')!.value;
      const art=this.billform.get('productTypeNo')!.value;
      console.log("GOLD"+this.getProductTypeNo("GOLD"));
      if (art==this.getProductTypeNo("GOLD")){
        const tot=wei*3000
        if (tot<=amo){
          const tot2=parseInt(amo)+200
          this.billform.patchValue({presentValue:tot2})
        }
        else if (tot>amo){
          this.billform.patchValue({presentValue:tot})
        }
    
      }
      else if(art==this.getProductTypeNo("SILVER")){
        const tot=wei*35
        if (tot<=amo){
          const tot2=amo+100
          this.billform.patchValue({presentValue:tot2})
        }
        else if (tot>amo){
          this.billform.patchValue({presentValue:tot})
        }


      }
}

roiacess() {
  console.log('in roi access');
  
  const goldProducts = this.productOptions.filter((item: { productTypeCode: string }) => item.productTypeCode === 'GOLD');
  const silverProducts = this.productOptions.filter((item: { productTypeCode: string }) => item.productTypeCode === 'SILVER');

  const art = this.billform.get('productTypeNo')!.value;
  const amo = this.billform.get('amount')!.value;

  // Handle gold products
  const goldProduct = goldProducts.find((product: { productTypeNo: any; }) => product.productTypeNo === art);
  if (goldProduct) {
    if (amo <= 5000) {
      this.billform.patchValue({ rateOfInterest: this.goldROI5K });
    } else if (amo > 5000 && amo < 10000) {
      this.billform.patchValue({ rateOfInterest: this.goldROI10K });
    } else if (amo >= 10000 && amo <= 20000) {
      this.billform.patchValue({ rateOfInterest: this.goldROI20K });
    } else if (amo > 20000 && amo <= 50000) {
      this.billform.patchValue({ rateOfInterest: this.goldROI50K });
    } else if (amo > 50000 && amo < 100000) {
      this.billform.patchValue({ rateOfInterest: this.goldROI100K });
    } else if (amo >= 100000) {
      this.billform.patchValue({ rateOfInterest: this.goldROI100Kplus });
    }
  } 

  // Handle silver products
  else if (silverProducts.some((product: { productTypeNo: any; }) => product.productTypeNo === art)) {
    this.billform.patchValue({ rateOfInterest: this.silverROI });
  } 

  // Handle other products
  else {
    const matchingProduct = this.productOptions.find((item: { productTypeNo: any; productTypeCode: string }) => item.productTypeNo === art);
    if (matchingProduct) {
      this.billform.patchValue({ rateOfInterest: matchingProduct.rateOfInterest });
    }
  }
}
calculateIntrestPledgeAndTotalGive() {
  const roi = parseFloat(this.billform.get('rateOfInterest')!.value) || 0;  // Get rate of interest and ensure it's a number
  const amount = parseFloat(this.billform.get('amount')!.value) || 0;      // Get amount and ensure it's a number

  // Calculate intrestpledge (simple interest calculation)
  const intrestpledge = (roi * amount) /  100;

  // Ensure totalgive is calculated properly (amount + interest)
  const totalgive = amount-intrestpledge;  // Assuming you want to add interest to the amount

  // Update form controls with computed values (formatted to 2 decimal places)
  this.billform.patchValue({
    interstpledge: intrestpledge.toFixed(2),  // Display intrestpledge to two decimal places
    totalgive: totalgive.toFixed(2)           // Display totalgive to two decimal places
  });
}

    // Example function to toggle disabled state
toggleBillSerialInput() {
  this.isBillSerialDisabled = !this.isBillSerialDisabled;
}
imageUrl: string | ArrayBuffer | null = null;

generatePdf() {
  const bill = {
    amount: parseInt(this.billform.get('amount')?.value),
    billSerial: String(this.billform.get('billSerial')?.value),
    billDate: String(this.billform.get('billDate')?.value),
    billNo: parseInt(this.billform.get('billNo')?.value),
    careOf: this.billform.get('careOf')?.value || 'N/A',
    productTypeNo: parseInt(this.billform.get('productTypeNo')?.value),
    amountInWords: String(this.billform.get('AmountInWords')?.value),
    presentValue: parseInt(this.billform.get('presentValue')?.value),
    grams: parseInt(this.billform.get('grams')?.value),
    monthlyIncome: parseInt(this.billform.get('monthlyIncome')?.value),
    redemptionDate: this.billform.get('redemptionDate')?.value || 'N/A',
    redemptionInterest: parseInt(this.billform.get('redemptionInterest')?.value),
    redemptionTotal: parseInt(this.billform.get('redemptionTotal')?.value),
    redemptionStatus: this.billform.get('redemptionStatus')?.value || 'N/A',
    billRedemSerial: this.billform.get('billRedemSerial')?.value || 'N/A',
    billRedemNo: parseInt(this.billform.get('billRedemNo')?.value),
    comments: this.billform.get('comments')?.value || 'N/A',
    rateOfInterest:parseInt(this.billform.get('rateOfInterest')?.value),
  };

  const doc = new jsPDF();

  // Page width and height
  const pageWidth = doc.internal.pageSize.getWidth();
  const marginLeft = 10;
  const marginRight = 10;
  const contentWidth = pageWidth - marginLeft - marginRight;

  // Center title
  doc.setFontSize(16);
  doc.text('Bill Details', pageWidth / 2, 20, { align: 'center' });

  // Set font size for content
  doc.setFontSize(12);

  // Bill details
  const lines = [
    `Bill Serial: ${bill.billSerial}`,
    `Bill No: ${bill.billNo}`,
    `Bill Date: ${bill.billDate}`,
    `Amount: ${bill.amount}`,
    `Amount in Words: ${bill.amountInWords}`,
    `Care Of: ${bill.careOf}`,
    `Product Type No: ${bill.productTypeNo}`,
    `Present Value: ${bill.presentValue}`,
    `Grams: ${bill.grams}`,
    `Monthly Income: ${bill.monthlyIncome}`,
    `Redemption Date: ${bill.redemptionDate}`,
    `Redemption Interest: ${bill.redemptionInterest}`,
    `Redemption Total: ${bill.redemptionTotal}`,
    `Redemption Status: ${bill.redemptionStatus}`,
    `Bill Redemption Serial: ${bill.billRedemSerial}`,
    `Bill Redemption No: ${bill.billRedemNo}`,
    `Comments: ${bill.comments}`
  ];

  let yPos = 30; // Initial y position
  lines.forEach(line => {
    // You can center each line or align to right by using {align: 'center'} or {align: 'right'}
    doc.text(line, marginLeft, yPos); // Align to the left
    yPos += 10; // Increase y position for the next line
  });
  doc.save('bill-details.pdf');
  const pdfData = doc.output('bloburl');
  const printWindow = window.open(pdfData);
  printWindow?.print();
}
@ViewChild('fileInput') fileInput: ElementRef | undefined;
triggerFileInput(): void {
  this.fileInput?.nativeElement.click(); // Simulate a click on the hidden file input
}

  resetForm(){
    this.billform.patchValue({
      customerName:'',
      grams:'',
      productQuantity:'',
      productDescription:'',
      comments:'',
      oldbillserialno:'',
      customerid:'',
      phoneno:'',
      fullAddress:'',
      presentValue:'',
      AmountInWords:'',
      monthlyIncome:'',
      proofType:'A',
      proofDetails:'',
      mailid:'',
      totalgive:'',
      interstpledge:'',
      productTypeNo:'G'

    })
    this.photoPreview=null
  }
  
  handleFilePreview(): void {
    const filePath = 'C:\\Users\\deepa\\OneDrive\\Pictures\\Screenshots\\Screenshot 2024-09-22 224317.png';
    const file = this.createFileFromPath(filePath);

  
    if (file) {
      // Update the form control with the file
      this.billform.patchValue({
        photo: file
      });
  
      // Display the image preview using FileReader
      const reader = new FileReader();
      reader.readAsDataURL(file); // Read file as Data URL (for image preview)
      reader.onload = () => {
        this.photoPreview = reader.result;  // Assign the base64 data URL to `photoPreview`
        this.triggerFileInput();
        console.log('Image preview:', this.photoPreview);  // Log the result to verify
      }; 
    }}

   // Handle file selection
   onFileChange(event: Event): void {
    console.log('in file change');
    const input = event.target as HTMLInputElement;
  
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.selectFiles = file; // Store the selected file
  
      const reader = new FileReader();
      reader.onload = () => {
        this.photoPreview = reader.result as string; // Ensure the type is string
        console.log('Photo preview URL:', this.photoPreview); // Debug log
      };
  
      reader.readAsDataURL(file); // Read the file as a data URL
  
      // Set the file name in the form control
      this.billform.patchValue({
        image_path: file.name,
      });
  
      console.log('Selected file:', this.selectFiles);
    } else {
      console.log('No file selected.');
    }
  }
   // Function to get productTypeNo by productTypeCode
 getProductTypeNo(productTypeCode: string): number | undefined {
  const product = this.productTypes.find(pt => pt.productTypeCode === productTypeCode);
  return product?.productTypeNo; // This will return undefined if no match is found
}

  }
  
    interface Window {
  webkitSpeechRecognition: any;
}


export interface ProductTypes {
  productTypeNo: number;
  productTypeCode: string;
  productTypeDescription: string;
  rateOfInterest: number;

}