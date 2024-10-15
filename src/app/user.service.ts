import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { Settings } from './setting/setting';
import { Customer } from './add-customer/Customer';
import { Bill } from './pledge/Bill';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  public apiUrl = 'http://localhost:8080/jewelbankersapi/'; // Update with your actual API endpoint
  public domainURL = 'http://localhost:8080/jewelbankersapi/'; // Update with your actual API endpoint

  constructor(private http: HttpClient) { }

  getUsers(): Observable<any[]> {
    const token = sessionStorage.getItem('accessToken');
    let headers = new HttpHeaders();
   // headers.set("Access-Control-Allow-Origin","*");
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);      
    }
    return this.http.get<any[]>(this.apiUrl + 'api/users/list', { headers });
  }


  addUser(user: any): Observable<any> {
    const token = sessionStorage.getItem('accessToken');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return this.http.post<any>(this.apiUrl + 'api/auth/signup', user, { headers });
  }


  deleteUser(id: number): Observable<any> {
    const token = sessionStorage.getItem('accessToken');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return this.http.delete<any>(`${this.apiUrl}api/users/delete/${id}`, { headers });
  }

  editUser(id: number, user: any): Observable<any> {
    const token = sessionStorage.getItem('accessToken');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers
      .set('Authorization', `Bearer ${token}`)
      .set( 'Content-Type', 'application/json');
    }
    return this.http.put<any>(`${this.apiUrl}api/users/edit/${id}`, user, { headers });
  }

  get_httpHeader(){
    const token = sessionStorage.getItem('accessToken');
    let headers = new HttpHeaders();
    console.log("token"+token);
    if (token) {
      return {
        headers: new HttpHeaders({
          'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'})
      };
    }else{
      return {
        headers: new HttpHeaders({
        })
      };
    }    
  }

  get_httpHeaderPhoto(){
    const token = sessionStorage.getItem('accessToken');
    let headers = new HttpHeaders();
    console.log("token"+token);
    if (token) {
      return {
        headers: new HttpHeaders({
          'Authorization': `Bearer ${token}`})
      };
    }else{
      return {
        headers: new HttpHeaders({
        })
      };
    }    
  }

  get_httpHeaderBlob() : any{
    const token = sessionStorage.getItem('accessToken');
    if (token) {
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`, // Add your token or any auth header if needed
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'  // Specify that we expect an Excel response
      }); 
      return headers;
    }
    return null;
}
exportBillsToExcel(url: string): Observable<Blob> {
  const token = sessionStorage.getItem('accessToken');
  
  // Initialize headers with Authorization if the token is present
  let headers = new HttpHeaders();
  if (token) {
    headers = headers.set('Authorization', `Bearer ${token}`);
  }
   headers
   .set('Content-Type', 'application/json')
   .set('Accept', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'); // To handle Excel file content

  // Make the request to get the Excel file
  return this.http.get(url, { headers: headers, responseType: 'blob' });
}

// Assuming the URL and headers are already defined in the UserService
generateAuctionPdf(url: string): Observable<Blob> {
  const token = sessionStorage.getItem('accessToken');
  
  // Initialize headers with Authorization if the token is present
  let headers = new HttpHeaders();
  if (token) {
    headers = headers.set('Authorization', `Bearer ${token}`);
  }

  headers = headers.set('Content-Type', 'application/json').set('Accept', 'application/pdf');

  // Make the request to get the PDF
  return this.http.get(url, { headers: headers, responseType: 'blob' });
}
getMySettingParamValueById(paramId: string, settings: Settings[]): string | undefined {
  const setting = settings.find(setting => setting.paramId === paramId);
  return setting ? setting.paramValue : undefined;  // Return paramValue or undefined if not found
}
getSettings(): Observable<Settings[]> {
  const url = `${this.apiUrl}settings`; // Append to base URL
  return this.http.get<Settings[]>(url, this.get_httpHeader());
}

getCustomersByName(customerName: string): Observable<Customer[]> {
  const url = `${this.apiUrl}customers?customerName=${customerName}`;
  return this.http.get<Customer[]>(url, this.get_httpHeader());
}

getNextBillNumber(): Observable<{ nextBillNo: number }> {
  const url = `${this.apiUrl}bills/next-bill-number`;
  return this.http.get<{ nextBillNo: number }>(url, this.get_httpHeader());
}
createBill(body: FormData): Observable<any> {
  const url = `${this.apiUrl}bills/create`;
  return this.http.post(url, body, this.get_httpHeaderPhoto());
}
get_httpHeader_photo() {
  const token = sessionStorage.getItem('accessToken');
  let headers = new HttpHeaders();
  console.log("token: " + token);
  
  if (token) {
    // Return HttpHeaders directly
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      // 'Content-Type': 'application/json' // Do not set Content-Type for FormData, it will be set automatically
    });
  } else {
    return new HttpHeaders(); // Return an empty HttpHeaders instance
  }
}

createCustomer(customerData: any, photoFiles: any): Observable<any> {
  console.log("Customer Data Received: ", customerData);

  const url = `${this.apiUrl}customers/add`;
  const formData: FormData = new FormData();

  // Check if customerData and customerData.customer exist
  if (!customerData || !customerData.customer) {
    console.error("Customer data or customer object is missing.");
    return throwError(() => new Error("Customer data is incomplete or invalid."));
  }

  // Append customer data fields to FormData
  formData.append('mailid', customerData.customer.mailid || '');
  formData.append('customerName', customerData.customer.customerName || '');
  formData.append('proofType', customerData.customer.proofType || '');
  formData.append('proofDetails', customerData.customer.proofDetails || '');
  formData.append('address', customerData.customer.address || '');
  formData.append('fullAddress', customerData.customer.fullAddress || '');

  // Handle optional fields in customerData
  if (customerData.customer.phoneno) {
    formData.append('phoneno', customerData.customer.phoneno.toString());
  }
  if (customerData.customer.relationship) {
    formData.append('relationship', customerData.customer.relationship || '');
  }
  if (customerData.customer.relationshipname) {
    formData.append('relationshipname', customerData.customer.relationshipname || '');
  }

  // Append other data fields related to the transaction
  formData.append('amount', customerData.amount?.toString() || '');
  formData.append('billSerial', customerData.billSerial || '');
  formData.append('billDate', customerData.billDate || '');
  formData.append('billNo', customerData.billNo?.toString() || '');
  formData.append('amountInWords', customerData.amountInWords || '');
  formData.append('presentValue', customerData.presentValue?.toString() || '');
  formData.append('grams', customerData.grams?.toString() || '');
  formData.append('monthlyIncome', customerData.monthlyIncome?.toString() || '');
  formData.append('rateOfInterest', customerData.rateOfInterest?.toString() || '');

  // Append bill details if available
  if (customerData.billDetails && Array.isArray(customerData.billDetails)) {
    customerData.billDetails.forEach((detail: any, index: number) => {
      formData.append(`billDetails[${index}].productDescription`, detail.productDescription || '');
      formData.append(`billDetails[${index}].productQuantity`, detail.productQuantity || '');
    });
  }

  // Append photo files to FormData
  console.log('in photo............:', photoFiles);

    
    formData.append('photo', photoFiles.name); // Append each file individually
    

  // Log the FormData contents for debugging
  formData.forEach((value, key) => {
    console.log(`${key}: ${value}`);
  });

  // Send the POST request with FormData
  return this.http.post(url, formData, {
    headers: this.get_httpHeader_photo(), // Ensure the correct headers are included
  });
}

postProductTypes(body: any): Observable<any> {
  const url = `${this.apiUrl}product_types`;
  return this.http.post(url, body, this.get_httpHeader());
}
getNextRedeemNumber(): Observable<{ nextBillRedemNo: number }> {
  const url = `${this.apiUrl}bills/next-redeem-number`;
  return this.http.get<{ nextBillRedemNo: number }>(url, this.get_httpHeader());
}

updateBill(id: number, billData: any): Observable<any> {
  const url = `${this.apiUrl}bills/${id}`;
  return this.http.put(url, billData, this.get_httpHeader());
}
deleteRedeemedBill(billSerial: string, billNo: string): Observable<any> {
  const url = `${this.apiUrl}bills/redeem?billSerial=${billSerial}&billNo=${billNo}`;
  return this.http.delete(url, this.get_httpHeader());
}
getBills(size: number): Observable<any> {
  const url = `${this.apiUrl}bills?size=${size}`;
  return this.http.get(url, this.get_httpHeader());
}
getProductTypes(): Observable<any> {
  const url = `${this.apiUrl}product_types`;    
  return this.http.get(url, this.get_httpHeader());
}
generateBillPdf(billSequence: number): Observable<Blob> {
  const url = `${this.apiUrl}bills/customerpdf/${billSequence}`;
  return this.http.get(url, {
    headers: this.get_httpHeader().headers,
    responseType: 'blob'
  });
}

getCustomerByPhone(phoneno: string): Observable<Customer[]> {
  const url = `${this.domainURL}customers?phoneno=${phoneno}`;
  return this.http.get<Customer[]>(url, this.get_httpHeader());
}
// Save redemption bill
saveRedemptionBill(bill: Bill): Observable<any> {
  const url = `${this.apiUrl}bills`; // Append to base URL
  const body = JSON.stringify(bill);
  return this.http.post<any>(url, body, this.get_httpHeader());
}


// Update bill after redemption
updateRedeemedBill(id: number, redeemFormValue: any): Observable<any> {
  const url = `${this.apiUrl}bills/${id}`; // Append to base URL
  return this.http.put<any>(url, redeemFormValue, this.get_httpHeader());
}
// Fetch bill by bill number and serial
getBillByNumber(billNo: number, billSerial: string): Observable<Bill[]> {
  const url = `${this.apiUrl}bills/number?billNo=${billNo}&billSerial=${billSerial}`;
  return this.http.get<Bill[]>(url, this.get_httpHeader());
}
downloadCustomerCopyPDF(billSequence: number): Observable<Blob> {
  const url = `${this.apiUrl}bills/redeempdf/${billSequence}`; // Construct URL with billSequence

  // Get the token from local storage
  const token = sessionStorage.getItem('accessToken');
    if (!token) {
    console.error('No token found'); // Debugging line
    return throwError('No token found');
  }

  // Set headers for authorization and PDF response
  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`, // Add the token in the header
    'Accept': 'application/pdf',
  });

  // Make the request to get the PDF
  return this.http.get(url, { headers: headers, responseType: 'blob' });
}


updateSettings(updatedSettings: any): Observable<any> {
  const url = `${this.apiUrl}settings`; // Use the base URL for settings
  return this.http.put(url, updatedSettings, this.get_httpHeader());
}
// downloadOfficeCopyPDF(billSequence: number): Observable<Blob> {
//   const url = `${this.apiUrl}bills/officepdf/${billSequence}`; // Construct URL with billSequence

//   // Get the token from local storage
//   const token = sessionStorage.getItem('accessToken');
//   if (!token) {
//     console.error('No token found'); // Debugging line
//     return throwError('No token found');
//   }

//   // Set headers for authorization and PDF response
//   const headers = new HttpHeaders({
//     'Authorization': `Bearer ${token}`, // Add the token in the header
//     'Accept': 'application/pdf', // Accept PDF response
//   });

//   // Make the HTTP GET request to download the PDF
//   return this.http.get(url, { headers, responseType: 'blob' }).pipe(
//     catchError(error => {
//       console.log('error here',error)
//       console.error('Error downloading PDF', error);
//       return throwError('Error downloading PDF'); // Handle error appropriately
//     })
//   );
// }
downloadOfficeCopyPDF(billSequence: number): Observable<Blob> {
  const url = `${this.apiUrl}bills/officepdf/${billSequence}`; // Construct URL with billSequence

  // Get the token from local storage
  const token = sessionStorage.getItem('accessToken');
    if (!token) {
    console.error('No token found'); // Debugging line
    return throwError('No token found');
  }

  // Set headers for authorization and PDF response
  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`, // Add the token in the header
    'Accept': 'application/pdf',
  });

  // Make the request to get the PDF
  return this.http.get(url, { headers: headers, responseType: 'blob' });
}

}
