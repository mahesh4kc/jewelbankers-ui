import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, FormArray, ReactiveFormsModule } from '@angular/forms';
import { UserService } from '../user.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-edit-user-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatCheckboxModule,
    CommonModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatDialogContent,
    MatDialogActions
  ],
  templateUrl: './edituser.component.html',
  styles: [
    `
    mat-form-field {
      display: block;
      width: 100%;
    }
    label {
      display: block;
      margin: 10px 0;
    }
  `
  ]
})
export class EditUserDialogComponent implements OnInit {
  editUserForm!: FormGroup;
  roles = ['user', 'admin'];
  checkboxValues: string[] = [];

  constructor(
    public dialogRef: MatDialogRef<EditUserDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    // Initialize the form with existing data
    this.editUserForm = this.fb.group({
      email: [this.data.email, [Validators.required, Validators.email]],
      password: [this.data.password, [Validators.required]],
      username: [this.data.username, [Validators.required]],
      roles: this.fb.array([]) // Initialize roles as a FormArray
    });

    // Populate roles based on existing data
    this.checkboxValues = this.data.roles || [];
    this.setExistingRoles();
  }

  setExistingRoles(): void {
    const rolesArray: FormArray = this.editUserForm.get('roles') as FormArray;
    this.roles.forEach(role => {
      rolesArray.push(this.fb.control(this.checkboxValues.includes(role)));
    });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onCheckboxChange(e: any) {
    const rolesArray: FormArray = this.editUserForm.get('roles') as FormArray;

    if (e.target.checked) {
      rolesArray.push(this.fb.control(e.target.value));
    } else {
      const index = rolesArray.controls.findIndex(x => x.value === e.target.value);
      rolesArray.removeAt(index);
    }
  }

  updateCheckbox(value: string, isChecked: any) {
    // Ensure isChecked and isChecked.target are defined
    if (isChecked && isChecked.target) {
        const isCheckedValue = isChecked.target.checked;

        if (isCheckedValue) {
            // Add to array if checked
            this.checkboxValues.push(value);
        } else {
            // Remove from array if unchecked
            const index = this.checkboxValues.indexOf(value);
            if (index !== -1) {
                this.checkboxValues.splice(index, 1);
            }
        }

        // Update form control value with the updated array
        const rolesArray: FormArray = this.editUserForm.get('roles') as FormArray;
        rolesArray.clear();
        this.roles.forEach(role => {
            rolesArray.push(this.fb.control(this.checkboxValues.includes(role)));
        });
    }
}

  onSubmit(): void {
    if (this.editUserForm.valid) {
      const userData = {
        email: this.editUserForm.value.email,
        password: this.editUserForm.value.password,
        username: this.editUserForm.value.username,
        roles: this.checkboxValues
      };
      this.dialogRef.close(userData);
      console.log(userData);
      this.userService.editUser(this.data.id, userData).subscribe(
        response => {
          console.log('User updated successfully:', response);
        },
        error => {
          console.error('Error updating user:', error);
        }
      );
    } else {
      console.log("Form not valid");
      // Handle form validation errors as needed
    }
  }
}
