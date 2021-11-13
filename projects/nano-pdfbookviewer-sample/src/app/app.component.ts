import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  label = ''
  pdfSource = 'http://localhost:4000/compressed.tracemonkey-pldi-09.pdf'
  
  ngOnInit() {}

  onPdfLoadingState(isLoading$: any) {
    const isLoading = isLoading$ as boolean;
    this.label = isLoading ? 'LOADING' : 'NOT LOADING'
  }
}
