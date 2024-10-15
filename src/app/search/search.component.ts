import {Component, OnInit,Renderer2, ViewChild } from '@angular/core';
import {ChangeDetectionStrategy} from '@angular/core';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {provideNativeDateAdapter} from '@angular/material/core';
import {MatIconModule} from '@angular/material/icon';
import { MatNativeDateModule } from '@angular/material/core';
import {MatSelectModule} from '@angular/material/select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule, JsonPipe } from '@angular/common';
import {Observable, of, throwError} from 'rxjs';
import {catchError, map, startWith, switchMap} from 'rxjs/operators';
import {AsyncPipe} from '@angular/common';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {default as _rollupMoment} from 'moment';
import { Injectable } from '@angular/core';
import { HTTP_INTERCEPTORS, HttpClient, HttpClientModule, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Bill } from '../pledge/Bill';
import { UserService } from '../user.service';
import { AuthInterceptor } from '../interceptors/auth.interceptor';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import { AfterViewInit, ElementRef } from '@angular/core';
import { HeaderComponent } from "../header/header.component";
import { FooterComponent } from "../footer/footer.component";
import { MatSnackBar } from '@angular/material/snack-bar';
import { Customer } from '../add-customer/Customer';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [MatTableModule,JsonPipe,MatAutocompleteModule, HttpClientModule, AsyncPipe, CommonModule, RouterModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatDatepickerModule, MatIconModule, MatNativeDateModule, MatSelectModule, HeaderComponent, FooterComponent,FormsModule],
  templateUrl: './search.component.html',
  styleUrl: './search.component.css',
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ],
})
export class SearchComponent implements OnInit,AfterViewInit {
  @ViewChild('myInput') myInputElement!: ElementRef;
  searchForm: FormGroup;
  bills!: Bill[];
  //dataSource = this.bills;
  dataSource!: MatTableDataSource<any> ;//= new MatTableDataSource<any>([]); // Initialize with an empty array
  isSearchDate:boolean=false
  isSearchDateAlso:boolean=false

  // bills: Bill[] = [];  
  isBillSerialDisabled: boolean = true;
  selectedCustomer: Data | undefined;
  readonly range = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
  });

  transcript: string = '';
  myControl = new FormControl('');
  options: any[] = [];
  filteredOptions: Observable<string[]> | undefined;
  unSearched:boolean=true
  url:String=""
  data:any
  displayedColumns: string[] = ['billSerial', 'billNo', 'billDate', 'customerName', 'address', 'grams', 'amount', 'productDescription', 'RedeemNO', 'redemptionDate'];
  rangeGroup: any;
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: HttpClient,
    private renderer: Renderer2,
    private userService: UserService ,
    private snackBar:MatSnackBar,
    private route: ActivatedRoute ,private authService: AuthService ) {
    this.dataSource = new MatTableDataSource<Bill>();
    this.searchForm = this.fb.group({
      search: [''],
      myControl: this.myControl // Bind the form control to the form group
    });
    this.range = this.fb.group({
      start: [null as Date | null],
      end: [null as Date | null]
    });
    
      this.http.get(`${this.userService.apiUrl}bills?size=`,this.userService.get_httpHeader()).subscribe((resp:any)=>{
      console.log(resp)
      this.dataSource.data=resp.content
    })
    console.log(this.data)
  }
  ngAfterViewInit() {
    this.myInputElement.nativeElement.focus();
  }

  ngOnInit() {
    this.searchForm.patchValue({ billserial: 'B' });
    this.filteredOptions = this.myControl.valueChanges.pipe(
      startWith(''),
      switchMap(value => this._filter(value || '')), 
    );
    this.data = history.state.data;
    if (this.data) {
      this.patchFormValues(history.state.data.data);
    } else {
      console.error('No data received in PledgeComponent');
    }

  }
  patchFormValues(data: any) {
    if(data.customer_name){
      this.searchForm.patchValue({
        myControl:data.customer_name
      })
      }
      else{
        this.searchForm.patchValue({
          myControl:data.bill_number   
        })
      }
    }
    private _filter(value: string): Observable<string[]> {
      const input = value.toLowerCase();
    
      // Fetch filtered customer records from the API
      return this.userService.getCustomersByName(input).pipe(
        map((resp: Customer[]) => {
         // console.log(apiUrl)
          console.log(resp)
          let filteredOptions: string[] = [];
          // this.options=resp
    
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
        catchError((error) => {
          console.error('Error fetching customer data:', error);
    
          // If an error occurs, return the user's input as the only option
          return of([value]);  // Ensure to return an Observable<string[]>
        })
      );
    }      


  validateBill(input: string): boolean {
    const regex = /^[a-zA-Z]\d{4,5}$/;
    return regex.test(input);
  }
  toggle(){
    console.log("isSearchDate"+this.isSearchDate);
    this.isSearchDate=!this.isSearchDate
  }
  toggle1(){
    console.log("isSearchDate"+this.isSearchDateAlso);
    this.isSearchDateAlso=!this.isSearchDateAlso
  }

  formatDateToYYYYMMDD(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  }
  createUrl(need:String,params: { amount: number | null, name: string | null, article: string | null, billNumber: string | null, redeem: boolean, open: boolean }): string {
    // Base URL
    const baseUrl = `${this.userService.apiUrl}${need}?`;
    
    // Initialize an array to hold query parameters
    let queryParams: string[] = [];
  
    // Include amount if it's not 0 or null
    if (params.amount !== 0 && params.amount !== null) {
      queryParams.push(`amount=${params.amount}`);
    }
  
    // Include billNumber if it exists
    if (params.billNumber) {
      queryParams.push(`search=${encodeURIComponent(params.billNumber)}`);
    }
  
    // Include article if it exists
    if (params.article) {
      queryParams.push(`article=${encodeURIComponent(params.article)}`);
    }
  
    // Include status based on redeem and open
    if (params.redeem) {
      queryParams.push('status=R');
    } else if (params.open) {
      queryParams.push('status=O');
    }
  
    // Include name if it exists
    if (params.name) {
      queryParams.push(`search=${encodeURIComponent(params.name)}`);
    }
  
    const finalUrl = baseUrl + queryParams.join('&');
    return finalUrl;
  }
  exportBillsToExcel() {
    const startControl = this.range.get('start') as FormControl<Date | null>;
    const startValue = startControl.value;
    const endControl = this.range.get('end') as FormControl<Date | null>;
    const endValue = endControl.value;
    const Start=`${startValue?.toISOString().split('T')[0]}`
    const endate=`${endValue?.toISOString().split('T')[0]}`

    let url=''
    if (this.isSearchDate){
      url=`${this.userService.apiUrl}bills/export/excel?&fromDate=${Start}&toDate=${endate}`
      console.log('URL IS THIS',url)
    }
    else{
      if(this.isSearchDateAlso){
        console.log(Start)
        if(Start!=undefined){
          url=this.createUrl('bills/export/excel',this.parseInput(this.myControl.value))
          url=url+`&fromDate=${Start}&toDate=${endate}`
          console.log('URL IS THIS',url)
        }
        else{
          url=this.createUrl('bills/export/excel',this.parseInput(this.myControl.value))
          console.log('URL IS THIS',url)
        }
      }
      else{
        url=this.createUrl('bills/export/excel',this.parseInput(this.myControl.value))
        console.log('URL IS THIS',url)
      }
    }
    this.userService.exportBillsToExcel(url).subscribe((response: Blob) => {
      const blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const excelUrl = window.URL.createObjectURL(blob);
      
      // Create an anchor element and trigger the download
      const a = document.createElement('a');
      a.href = excelUrl;
      a.download = 'bills.xlsx'; // Specify the filename here
      document.body.appendChild(a);
      a.click();
      a.remove();
      
      // Clean up the object URL
      window.URL.revokeObjectURL(excelUrl);

      
    }, error => {
      console.error('Error downloading the Excel file', error);
    });
    
    
  }

  getDateValue(value:string): string {
    const startControl = this.range.get(value) as FormControl<Date | null>;
    return startControl.value ? startControl.value.toISOString().split('T')[0] : ''; // Format as YYYY-MM-DD
  }




  onSubmit(form: FormGroup) {
    const startControl = this.range.get('start') as FormControl<Date | null>;
    const startValue = startControl.value;
    const endControl = this.range.get('end') as FormControl<Date | null>;
    const endValue = endControl.value;
    const Start=`${startValue?.toISOString().split('T')[0]}`
    const endate=`${endValue?.toISOString().split('T')[0]}`
    console.log('SEE HEREEEE:',Start,endate);    
    if (this.searchForm.valid) {
    let url=''
    if (this.isSearchDate){
      url=`${this.userService.apiUrl}bills/fullsearch?&fromDate=${Start}&toDate=${endate}`
      console.log('URL IS THIS',url)
    }
    else{
      if(this.isSearchDateAlso){
        console.log(Start)
        if(Start!=undefined){
          url=this.createUrl('bills/fullsearch',this.parseInput(this.myControl.value))
          url=url+`&fromDate=${Start}&toDate=${endate}`
          console.log('URL IS THIS',url)
        }
        else{
          url=this.createUrl('bills/fullsearch',this.parseInput(this.myControl.value))
          console.log('URL IS THIS',url)
        }
      }
      else{
        url=this.createUrl('bills/fullsearch',this.parseInput(this.myControl.value))
        console.log('URL IS THIS',url)
      }

    }
    this.http.get(url, this.userService.get_httpHeader())
    .pipe(
      catchError(this.handleError) // Handle errors here
    )
    .subscribe(
      (response: any) => {
        if (response == null || response.length === 0) {
          this.snackBar.open('No bills found', 'Close', {
            duration: 3000,
            verticalPosition: 'bottom',
          });
          console.log('Bill details:', response);
          this.dataSource.data = [];
        } else {
          console.log('Bills found:', response);
          this.dataSource.data = response;
        }
      },
      (error) => {
        this.handleError(error)

        console.error('Error fetching bills:', error); // Handle the error in the subscription
      }
    );
}
}
private handleError(error: HttpErrorResponse){
  if (error.status === 500) {
    this.snackBar.open('Server error. Please try again later.', 'Close', {
      duration: 3000,
      verticalPosition: 'bottom',
    });
  } else {
    this.snackBar.open('An error occurred. Please try again.', 'Close', {
      duration: 3000,
      verticalPosition: 'bottom',
    });
  }
  console.error('Error status:', error.status);
  return throwError(() => error); // Rethrow the error
}
  


  generateAuctionPdf(){
    const startControl = this.range.get('start') as FormControl<Date | null>;
    const startValue = startControl.value;
    const endControl = this.range.get('end') as FormControl<Date | null>;
    const endValue = endControl.value;
    const Start=`${startValue?.toISOString().split('T')[0]}`
    const endate=`${endValue?.toISOString().split('T')[0]}`

    let url=''
    if (this.isSearchDate){
      url=`${this.userService.apiUrl}generate-auction-pdf?&fromDate=${Start}&toDate=${endate}`
      console.log('URL IS THIS',url)
    }
    else{
      if(this.isSearchDateAlso){
        console.log(Start)
        if(Start!=undefined){
          url=this.createUrl('generate-auction-pdf',this.parseInput(this.myControl.value))
          url=url+`&fromDate=${Start}&toDate=${endate}`
          console.log('URL IS THIS',url)
        }
        else{
          url=this.createUrl('generate-auction-pdf',this.parseInput(this.myControl.value))
          console.log('URL IS THIS',url)
        }
      }
      else{
        url=this.createUrl('generate-auction-pdf',this.parseInput(this.myControl.value))
        console.log('URL IS THIS',url)
      }
    }
    this.userService.generateAuctionPdf(url).subscribe((response: Blob) => {
      const blob = new Blob([response], { type: 'application/pdf' });
      const pdfUrl = window.URL.createObjectURL(blob);
      window.open(pdfUrl);
      window.URL.revokeObjectURL(pdfUrl);  // Clean up after download
    }, error => {
      console.error('Error downloading the PDF file', error);
    });
  }
  customer:boolean=false
  amount:boolean=false
  date:boolean=false
  redeem=false
  open=false

  
  checkJsonFieldsWithValues(parsedData: any): Record<string, any> {
    // Define the flags with their values from parsed data
    let flagsWithValues = {
      customer: parsedData.customer || undefined,
      amount: parsedData.amount || undefined,
      date: undefined, // Not available in the input
      redeem: parsedData.status === 'redeemed' ? parsedData.status : undefined,
      open: parsedData.status === 'open' ? parsedData.status : undefined,
    };
  
    // Filter out keys with undefined values
    const trueFlagsWithValues = Object.fromEntries(
      Object.entries(flagsWithValues).filter(([key, value]) => value !== undefined)
    );
  
    return trueFlagsWithValues;
  }
  
  parseInput(input: string | null): {
    amount: number;
    name: string | null;
    article: string | null;
    billNumber: string | null;
    redeem: boolean;
    open: boolean;
} {
    // Initialize parsed result with default values
    let parsedResult = {
        amount: 0,
        name: null as string | null, // Allow name to be string or null
        article: null as string | null, // Allow article to be string or null
        billNumber: null as string | null, // Allow billNumber to be string or null
        redeem: false,
        open: false
    };

    // Ensure the input is a valid string
    if (input === null) {
        console.error('Input is null');
        return parsedResult; // Return default values
    }

    // Split the input by spaces
    const parts = input.split(/\s+/);
    
    // Initialize variables for name and amount
    let nameParts: string[] = [];

    // Iterate over the parts to detect amount, name, and billNumber
    for (let part of parts) {
        if (/^\d+$/.test(part)) {
            // If the part is all digits, treat it as the amount
            parsedResult.amount = parseInt(part, 10);
        } else if (/^[a-zA-Z]\d{4}$/.test(part)) {
            // If the part matches a pattern like 'A6678', treat it as billNumber
            parsedResult.billNumber = part;
        } else if (part.toLowerCase() === 'redeem') {
            // If the part is 'redeem', set redeem to true
            parsedResult.redeem = true;
        } else if (part.toLowerCase() === 'open') {
            // If the part is 'open', set open to true
            parsedResult.open = true;
        } else {
            // Otherwise, treat the part as part of the name
            nameParts.push(part);
        }
    }

    // Join all name parts into a single string
    parsedResult.name = nameParts.join(' ');

    return parsedResult;
}
      }      


interface Data {
  id: any;
  area: any;
  mailid: any;
  phone: any;
  pincode: any;
  customerName: any;
  street: any;
  district: any;
  country: any;
  relationShip: any;
  relationShipName: any;
  address?: any;
}

// function saveAs(blob: Blob, arg1: string) {
//   throw new Error('Function not implemented.');
// }
