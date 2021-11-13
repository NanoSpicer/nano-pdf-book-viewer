import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { BehaviorSubject, Subject, combineLatest, filter, distinctUntilChanged, takeUntil } from 'rxjs';

declare var PageFlip: any;

// Required to initialize PDF JS
declare var pdfjsLib: any;
declare var pdfjsWorker: any;

@Component({
  selector: 'nano-pdf-book-viewer',
  templateUrl: './nano-pdf-book-viewer.component.html',
  styleUrls: ['./nano-pdf-book-viewer.component.css']
})
export class NanoPdfBookViewerComponent implements OnInit {
  @ViewChild('book') bookElRef!: ElementRef<HTMLElement>
  @Input() pdfSrc!: string
  @Output() loading = new EventEmitter<boolean>()

  pdfPages: Array<any> = []
  private pdf: any | null = null

  private pageFlip!: any // PageFlip
  private viewHasInitialized = new BehaviorSubject(false)
  private pdfDidLoadAndRender$ = new BehaviorSubject(false)
  private viewHasBeenDestroyed = new Subject<boolean>()
  private hasInitializedCanvases = false


  ngOnInit() {
    this.fetchPdf()
    const sources = [
      this.viewHasInitialized.asObservable(),
      this.pdfDidLoadAndRender$
    ]
    const canLoad = combineLatest(sources).pipe(
      filter(([pdfDidLoadAndRender, pdfDidLoad]) => pdfDidLoadAndRender && pdfDidLoad),
      // Avoid double emissions
      distinctUntilChanged(),
      takeUntil(this.viewHasBeenDestroyed)
    )
    canLoad.subscribe(() => this.initializeBookFlip())
  }

  ngAfterViewInit() {
    this.viewHasInitialized.next(true)
  }

  ngAfterViewChecked() {
    const pdf = this.pdf
    if(!pdf) return
    if(this.hasInitializedCanvases) return 
    this.hasInitializedCanvases = true
    this.initializeCanvases(pdf)
  }

  ngOnDestroy() {
    this.viewHasBeenDestroyed.next(true)
    this.viewHasBeenDestroyed.complete()
  }

  private async fetchPdf(): Promise<boolean> {
    this.loading.emit(true)
    pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;
    const loadingTask = pdfjsLib.getDocument(this.pdfSrc);
    this.pdf = await loadingTask.promise
    this.pdfPages = Array.from({length: this.pdf.numPages})
    return true
  }

  private initializeBookFlip() {
    this.pageFlip?.destroy()
    const element = this.bookElRef.nativeElement
    this.pageFlip = new PageFlip(element, {
      width: 680, // irrelevant because size is set to stretch
      height: 880,// irrelevant because size is set to stretch
      size: 'stretch', //as SizeType,
      // we could provide bindings to the underlying library, 
      // but that's just not happenning
      showCover: true,
      drawShadow: true,
      maxShadowOpacity: 0.25
    })

    this.pageFlip.loadFromHTML(document.querySelectorAll('.page'))
    this.loading.emit(false)
  }

  private async initializeCanvases(pdf: any) {
    const renderTasks = this.pdfPages.map(async (_, index) => {
      const pageNumber = index + 1 // pages are 1-indexed
      const page = await pdf.getPage(pageNumber)
      console.log(`Page[${pageNumber}] loaded `);
      const scale = 1.5;
      const viewport = page.getViewport({scale: scale});
      const canvas = document.querySelector(`#canvas-${index}`) as HTMLCanvasElement
      const context = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      const renderContext = {
        canvasContext: context,
        viewport: viewport
      };
      const renderTask = page.render(renderContext);
      return renderTask.promise
    })

    await Promise.all(renderTasks)
    this.pdfDidLoadAndRender$.next(true)
  }

}
