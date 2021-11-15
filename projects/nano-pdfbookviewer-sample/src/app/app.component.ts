import { Component, OnInit } from '@angular/core';


type TogglePdfState = 'FIRST' | 'SECOND'
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  label = ''
  toggleDisabled = false
  get pdfSource() {
    const host = 'http://localhost:4000'
    switch(this.toggleState) {
      case 'FIRST': return `${host}/compressed.tracemonkey-pldi-09.pdf`
      default: return `${host}/keyboard-shortcuts-macos.pdf`
    }
  }
  private toggleState: TogglePdfState = 'FIRST'

  onPdfLoadingState(isLoading$: any) {
    const isLoading = isLoading$ as boolean;
    this.toggleDisabled = isLoading === true // disable button if loading
    this.label = isLoading ? 'LOADING' : 'NOT LOADING'
  }

  onToggle() {
    this.toggleState = this.toggleState === 'FIRST' ? 'SECOND' : 'FIRST'
  }
}
