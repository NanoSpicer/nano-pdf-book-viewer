# NanoPdfBookViewer

A small PDF viewer in shape of a book for Angular Angular 13^


## Set up

1. Install the dependency
```bash
npm install --save nano-pdf-book-viewer
```

2. Add PDF JS scripts to your project so we can load the pdfs
```json
"scripts": [
  "node_modules/nano-pdf-book-viewer/scripts/pdf.2-11-338.worker.min.js",
  "node_modules/nano-pdf-book-viewer/scripts/pdf.2-11-338.min.js"
]
```

3. Import the module in your `AppModule`

```typescript
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
```
