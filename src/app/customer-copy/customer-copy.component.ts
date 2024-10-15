import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-customer-copy',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  templateUrl: './customer-copy.component.html',
  styleUrls: ['./customer-copy.component.css'] // Notice it is 'styleUrls' not 'styleUrl'
})
export class CustomerCopyComponent {
  constructor(public dialogRef: MatDialogRef<CustomerCopyComponent>){}

  onNoClick(): void {
    this.dialogRef.close(false); // Close dialog and return 'false'
  }

  onYesClick(): void {
    this.dialogRef.close(true); // Close dialog and return 'true'
  }
}
