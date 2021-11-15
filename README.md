# NanoPdfBookViewer

A small PDF viewer in shape of a book for Angular Angular 13^

<div align="center">
  <img src="./sample.gif">
</div>

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

## NanoPdfBookViewerComponent properties

* `[pdfSrc]` set this property to point to the PDF you'd like to load. Changing this property will result in loading the new PDF. Note that this value needs to be a valid URL
* `[pageNumber]` allows the developer to set the current page. It always performs the animation.
* `(loading)` emits `true` and `false` based on the state of the component; Downloading PDF, Rendering, etc. Once it's done rendering emits `true`.
* `(pdfPageCount)` emits the total number of pages once the PDF has been downloaded and parsed.
