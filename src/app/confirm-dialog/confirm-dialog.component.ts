import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.css'] // Corrected from 'styleUrl'
})
export class ConfirmDialogComponent {
  constructor(public dialogRef: MatDialogRef<ConfirmDialogComponent>){}

  onNoClick(): void {
    this.dialogRef.close(false); // Close dialog and return 'false'
  }

  onYesClick(): void {
    this.dialogRef.close(true); // Close dialog and return 'true'
  }
}
