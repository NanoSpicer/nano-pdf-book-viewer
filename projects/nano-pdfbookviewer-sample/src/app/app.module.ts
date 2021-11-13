import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NanoPdfBookViewerModule } from 'nano-pdf-book-viewer';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    NanoPdfBookViewerModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
