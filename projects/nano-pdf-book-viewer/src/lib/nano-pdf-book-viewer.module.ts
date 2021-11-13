import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NanoPdfBookViewerComponent } from './nano-pdf-book-viewer.component';



@NgModule({
  declarations: [
    NanoPdfBookViewerComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    NanoPdfBookViewerComponent
  ]
})
export class NanoPdfBookViewerModule { }
