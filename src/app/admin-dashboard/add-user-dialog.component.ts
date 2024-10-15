import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { UserService } from '../user.service';

@Component({
  selector: 'app-add-user-dialog',
  templateUrl: './add-user-dialog.component.html',
  styles: `
    mat-form-field {
      display: block;
      width: 100%;
    }

    label {
      display: block;
      margin: 10px 0;
    }
  `
})
export class AddUserDialogComponent {
  addUserForm: FormGroup;
  roles = ['user', 'admin'];
  checkboxValues :any = []; // Array to store checked checkbox values
  checkboxControl = new FormControl(); 

  constructor(
    public dialogRef: MatDialogRef<AddUserDialogComponent>,
    private fb: FormBuilder,
    private userService: UserService
  ) {
    this.checkboxControl.setValue(this.checkboxValues);
    this.addUserForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
      username: ['', [Validators.required]],
      roles: this.fb.array([]) // Initialize roles as a FormArray
    });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onCheckboxChange(e: any) {
    const rolesArray: FormArray = this.addUserForm.get('roles') as FormArray;
  
    if (e.target.checked) {
      rolesArray.push(this.fb.control(e.target.value));
    } else {
      const index = rolesArray.controls.findIndex(x => x.value === e.target.value);
      rolesArray.removeAt(index);
    }
  }
  
  updateCheckbox(value: string, isChecked: any) {
    console.log(isChecked.target.value);
    
    if (isChecked.target.checked) {
      // Add to array if checked
      this.checkboxValues.push(isChecked.target.value);
    } else {
      // Remove from array if unchecked
      const index = this.checkboxValues.indexOf(isChecked.target.value);
      if (index !== -1) {
        this.checkboxValues.splice(index, 1);
      }
    }
    // Update form control value with the updated array
    this.checkboxControl.setValue(this.checkboxValues);
  }

  onSubmit(): void {
    if (this.addUserForm.valid) {
      const userData = {
        email: this.addUserForm.value.email,
        password: this.addUserForm.value.password,
        username: this.addUserForm.value.username,
        roles: this.checkboxValues
      };
      this.dialogRef.close(userData);
      console.log(userData);
      this.userService.addUser(userData);
    } else {
      console.log("Form not valid");
      // Handle form validation errors as needed
    }
  }
}
