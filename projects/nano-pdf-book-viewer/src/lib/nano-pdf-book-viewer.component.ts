import { ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { BehaviorSubject, Subject, combineLatest, filter, distinctUntilChanged, takeUntil, map, delay } from 'rxjs';
import { PageFlip, SizeType } from 'page-flip'

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
  @Output() loading = new EventEmitter<boolean>()
  @Output() pdfPageCount = new EventEmitter<number>()


  get pdfSrc(): string {
    return this._pdfSrc;
  }

  @Input()
  set pdfSrc(v: string) {
    if (!this.isValidHttpUrl(v)) return // avoid invalid urls
    if (this.pdfSrc === v) return // Avoid dupped fetches
    this._pdfSrc = v;
    this.loadPdf()
  }
  @Input() set defaultStartPage(v: number) {
    this._defaultStartPage = v;
  }
  get defaultStartPage(): number {
    return this._defaultStartPage;
  }
  get pageNumber(): number {
    return this._pageNumber;
  }
  get showCover(): boolean {
    return this._showCover;
  }
  @Input() set showCover(v: boolean){
    this._showCover = v;
  }
  @Input()
  set pageNumber(v: number) {
    if (v >= this.pdfPages.length) return
    if (v < 0) return
    if (this.pageNumber === v) return
    this.pageFlip?.flip(v)
    this._pageNumber = v;
  }
  @Output() pageNumberChange = new EventEmitter<number>()


  pdfPages: Array<any> = []
  private _pdfSrc = ''
  private pdf: any | null = null
  private _pageNumber = 0
  private _defaultStartPage = 0
  private _showCover = false;
  private pageFlip: PageFlip | null = null
  private viewHasInitialized = new BehaviorSubject(false)
  private pdfDidLoadAndRender$ = new BehaviorSubject(false)
  private viewHasBeenDestroyed = new Subject<boolean>()
  private hasInitializedCanvases = false

  private static globalId: number = 0

  constructor(private changeDetectorRef: ChangeDetectorRef) { }

  ngOnInit() {
    pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;
    const sources = [
      this.pdfDidLoadAndRender$,
      this.viewHasInitialized.asObservable()
    ]
    const canLoad = combineLatest(sources).pipe(
      map(([pdfDidLoadAndRender, viewInitialized]) => ({ pdfDidLoadAndRender, viewInitialized })),
      filter(({ pdfDidLoadAndRender, viewInitialized }) => pdfDidLoadAndRender && viewInitialized),
      // Avoid double emissions
      distinctUntilChanged(),
      takeUntil(this.viewHasBeenDestroyed),
      delay(300)
    )
    canLoad.subscribe(() => this.initializeBookFlip())
  }


  loadPdf() {
    this.setInitialState()
    this.fetchPdf()
  }

  ngAfterViewInit() {
    // Once there's a view we may initialize all of this
    const element = this.bookElRef.nativeElement
    this.pageFlip = new PageFlip(element, {
      width: 680, // irrelevant because size is set to stretch
      height: 880,// irrelevant because size is set to stretch
      // set threshold values - important values because they help the orientation trigger
      minWidth: 315,
      maxWidth: 1000,
      minHeight: 420,
      maxHeight: 1350,
      size: 'stretch' as SizeType,
      // we could provide bindings to the underlying library,
      // but that's just not happenning
      showCover: this.showCover,
      drawShadow: true,
      maxShadowOpacity: 0.25,
      startPage: this.defaultStartPage

    })
    this.viewHasInitialized.next(true)
    this.pageFlip.on('flip', (e) => {
      this._pageNumber = e.data as number;
      this.pageNumberChange.emit(this._pageNumber)
      }
    );
  }

  ngAfterViewChecked() {
    const pdf = this.pdf
    if (!pdf) return
    if (this.hasInitializedCanvases) return
    if (this.pdfPages.length === 0) return
    console.log('Initializing canvases');
    this.hasInitializedCanvases = true
    this.initializeCanvases(pdf)
  }

  ngOnDestroy() {
    this.viewHasBeenDestroyed.next(true)
    this.viewHasBeenDestroyed.complete()
  }

  private isValidHttpUrl(urlString: string): boolean {
    try {
      // if it doesn't throw, it's a valid url
      const { protocol } = new URL(urlString);
      // Allow http protocols
      return ['http:', 'https:'].includes(protocol)
    } catch (_) {
      return false;
    }
  }

  private setInitialState() {
    this.pdf = null
    // Clear any left-over children that the page flip might've left behnid
    this.bookElRef?.nativeElement?.replaceChildren()
    this.pdfPages = []
    this._pageNumber = this.defaultStartPage
    this.pdfDidLoadAndRender$.next(false)
    this.hasInitializedCanvases = false
  }

  private async fetchPdf(): Promise<boolean> {
    this.loading.emit(true)
    const loadingTask = pdfjsLib.getDocument(this.pdfSrc);
    this.pdf = await loadingTask.promise
    this.pdfPages = Array.from({ length: this.pdf.numPages })
    return true
  }

  private initializeBookFlip() {
    if (!this.pageFlip) {
      console.log('no pageflip, skipping init');
      return
    }
    const htmlElements = Array.from(document.querySelectorAll<HTMLElement>('.page'))
    this.pageFlip.loadFromHTML(htmlElements)
    this.loading.emit(false)
    this.pdfPageCount.emit(htmlElements.length)
    this.pageNumberChange.emit(this.pageNumber)
  }

  private async initializeCanvases(pdf: any) {
    const renderTasks = this.pdfPages.map(async (_, index) => {
      const pageNumber = index + 1 // pages are 1-indexed
      const page = await pdf.getPage(pageNumber)
      console.log(`Page[${pageNumber}] loaded `);
      const viewport = page.getViewport({ scale: 1.5 });
      const canvas = document.querySelector(`#canvas-${index}`) as HTMLCanvasElement
      const context = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      const renderContext = {
        canvasContext: context,
        viewport: viewport
      };
      return page.render(renderContext).promise;
    })

    await Promise.all(renderTasks)
    this.pdfDidLoadAndRender$.next(true)
  }

}
