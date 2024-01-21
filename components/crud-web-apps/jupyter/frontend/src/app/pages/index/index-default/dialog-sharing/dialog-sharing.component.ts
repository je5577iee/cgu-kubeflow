// 2024/01/21 YCL create //
import { Component, OnInit, Inject } from '@angular/core';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {MatChipInputEvent} from '@angular/material/chips';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { StringDecoder } from 'string_decoder';
import {ChangeDetectionStrategy} from '@angular/core';
import {ScrollingModule} from '@angular/cdk/scrolling';
import {Observable} from 'rxjs';
import {FormControl} from '@angular/forms';
import { JWABackendService } from 'src/app/services/backend.service';

export interface Useremail {
  name: string;
}

@Component({
  selector: 'app-dialog-sharing',
  templateUrl: './dialog-sharing.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class DialogSharing implements OnInit {
  namespace: string;
  notebook: string;
 
  constructor(public backend: JWABackendService,private dialogRef: MatDialogRef<DialogSharing>, @Inject(MAT_DIALOG_DATA) public data: any) {
    this.namespace = data.namespace;
    this.notebook = data.name;
    
  }
  
  // 2024/01/21 分享清單內容 start//
  ngOnInit()  {
    this.backend.getAllAuthorizationPolicy(this.namespace).subscribe(aps => {
      console.log(this.namespace);
      var deletename = "notebook-"+this.notebook+"-authorizationpolicy-view";
      var names = aps.reduce((acc, ap) => {
        if (ap.metadata.name.includes(deletename) && ap.spec && ap.spec.rules) {
          ap.spec.rules.forEach(rule => {
            if (rule.when && rule.when[0] && rule.when[0].values) {
              acc.push(...rule.when[0].values);
            }
          });
        }
        return acc;
      }, []);
      console.log('View List:', names);
      this.viewlist = names;
    });
    this.backend.getAllAuthorizationPolicy(this.namespace).subscribe(aps => {
      var deletename = "notebook-"+this.notebook+"-authorizationpolicy-editable";
      var names = aps.reduce((acc, ap) => {
        if (ap.metadata.name.includes(deletename) && ap.spec && ap.spec.rules) {
          ap.spec.rules.forEach(rule => {
            if (rule.when && rule.when[0] && rule.when[0].values) {
              acc.push(...rule.when[0].values);
            }
          });
        }
        return acc;
      }, []);
      console.log('edit List:', names);
      this.editlist = names;
    });
  }  
  // 2024/01/21 分享清單內容 end//

  selected :string;
  selected1 = 'option1';
  copylink: string;
  visible = true;
  selectable = true;
  removable = true;
  addOnBlur = true;
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  fruitCtrl = new FormControl();
  filteredFruits: Observable<string[]>;
  //viewlist = ['yuch917@gmail.com','illops19@gmail.com']
  //editlist = ['yuch917@gmail.com','illops19@gmail.com']

  viewlist: string[] = [];
  editlist: string[] = [];

  // Chips of email start //
  useremail: Useremail[] = [];
  add(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    // Add email
    if ((value || '').trim()) {
      this.useremail.push({name: value.trim()});
    }

    // Reset the input value
    if (input) {
      input.value = '';
    }
  }
    // Remove value
  remove(useremail: Useremail): void {
    const index = this.useremail.indexOf(useremail);
    if (index >= 0) {
      this.useremail.splice(index, 1);
    }
  }
  // Chips email end //

  cancel(): void {
    this.dialogRef.close();
  }
  
  //2024/01/20 可添加多個email功能完成 start//
  useremailNames: string[] = [];
  myString:string;
  onSubmit() {
     this.useremailNames = this.useremail.map(email => email.name);
     this.dialogRef.close({ useremail: this.useremailNames, selected: this.selected });
  }
  //2024/01/20 可添加多個email功能完成 end//

 // CopyLink 選項 串連notebook的name和namespace start//
  updateCopyLink(){
    console.log('updateCopyLink:', this.selected);
    if (this.selected == 'option1') {
      this.copylink = `http://120.126.23.231/notebook/${this.namespace}/${this.notebook}/view/`;
    } else if(this.selected == 'option2') {
      this.copylink = `http://120.126.23.231/notebook/${this.namespace}/${this.notebook}/`;
    } else{
      this.copylink = `http://120.126.23.231/notebook/${this.namespace}/${this.notebook}/`;
    }
    console.log('copylink:', this.copylink);
  }
 // CopyLink 選項 串連notebook的name和namespace  end //

 // Expansion panel start // 
    panelOpenState = false;
 // Expansion panel end //

 // 2024/01/16 Expansion panel for view start //
  remove1(viewlist): void {
    const index1 = this.viewlist.indexOf(viewlist);
    if (index1 >= 0) {
      this.viewlist.splice(index1, 1);
    }
  }
  // 2024/01/16 Expansion panel for view end //

  // 2024/01/16 Expansion panel for edit start //
  remove2(editlist): void {
    const index2 = this.editlist.indexOf(editlist);
    if (index2 >= 0) {
      this.editlist.splice(index2, 1);
    }
  }
  // 2024/01/16 Expansion panel for edit end //

// 2024/01/20 取消所有分享function start //
    delete() {
       //Close the open dialog only if the DELETE request succeeded
      const delete_name= `notebook-${this.notebook}-authorizationpolicy-editable`
      console.log('Request URL:', `/api/namespaces/${this.namespace}/aps_vnc/${delete_name}`);
      if (delete_name) {
        this.backend.deleteauthorization(delete_name, this.namespace).subscribe({
        next: response => {
        console.log(`notebook-${this.notebook}-authorizationpolicy-editable`)
        console.log('success');
        },
        error: error => {
         console.log(`notebook-${this.notebook}-authorizationpolicy-editable`)
         console.log('error');
       }
      })};
      const delete_name2= `notebook-${this.notebook}-authorizationpolicy-view`
      if (delete_name2) {
       this.backend.deleteauthorization(delete_name2, this.namespace).subscribe({
        next: response => {
          console.log(`notebook-${this.notebook}-authorizationpolicy-view`)
          console.log('success');
        },
        error: error => {
          console.log(`notebook-${this.notebook}-authorizationpolicy-view`)
          console.log('error');
        }
      })};
 }
  // 2024/01/20 取消所有分享function end //
}
// 2024/01/21 YCL create //