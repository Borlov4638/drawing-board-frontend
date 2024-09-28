import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  HostListener,
} from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { DrawingService } from '../drawing.service';
import { EMPTY, catchError, from, of, switchMap, tap } from 'rxjs';
import { ImageMetaDataType } from '../types/image-metadata.type';
import { ImageS3Service } from '../aws/s3-image.service';
import { SendDrawingInterface } from '../intarfaces/send-drawing.interface';
import { DrawingPointMessage } from '../types/drawing-point.type';

@Component({
  selector: 'app-drawing-canvas',
  templateUrl: './drawing-canvas.component.html',
  styleUrls: ['./drawing-canvas.component.css'],
})
export class DrawingCanvasComponent implements AfterViewInit {
  @ViewChild('canvas', { static: true })
  canvasRef!: ElementRef<HTMLCanvasElement>;
  private context!: CanvasRenderingContext2D;
  private drawing = false;
  private roomId!: string;
  private currentColor: string = '#000000';
  private currentBrushSize: number = 5;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private drawingService: DrawingService,
    private router: Router,
    private imageS3Service: ImageS3Service
  ) {
    window.addEventListener('beforeunload', () =>
      drawingService.leaveRoom(this.roomId)
    );
  }

  ngAfterViewInit() {
    const canvas = this.canvasRef.nativeElement;
    const context = canvas.getContext('2d');

    if (!context) {
      throw new Error('Failed to get 2D context');
    }
    this.context = context;

    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.roomId = id;
        this.loadImage(id);
      }
    });

    this.drawingService.getDrawing().subscribe((data) => {
      this.drawFromData(data);
    });
  }

  loadImage(id: string) {
    this.http
      .get<ImageMetaDataType>(`http://localhost:5024/image/${id}`)
      .pipe(
        tap(() => {
          this.drawingService.joinRoom(id);
        }),
        catchError((error) => {
          this.router.navigate(['/']);
          return EMPTY;
        })
      )
      .subscribe((object) => {
        const imageUrl = this.imageS3Service.getSignedUrl(object.id);
        const img = new Image();
        img.src = imageUrl;
        img.onload = () => {
          const canvas = this.canvasRef.nativeElement;
          canvas.width = img.width;
          canvas.height = img.height;
          this.context.drawImage(img, 0, 0, img.width, img.height);
          this.drawingService.getHistory(object.id);
        };
      });
  }

  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent) {
    this.drawing = true;
    this.context.beginPath();
    this.context.moveTo(event.offsetX, event.offsetY);
    this.drawingService.sendDrawing({
      point: {
        type: 'start',
        x: event.offsetX,
        y: event.offsetY,
        color: this.currentColor,
        brushSize: this.currentBrushSize,
      },
      room: this.roomId,
    });
  }

  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (!this.drawing) return;

    const data = {
      point: {
        type: 'draw',
        x: event.offsetX,
        y: event.offsetY,
        color: this.currentColor,
        brushSize: this.currentBrushSize,
      },
      room: this.roomId,
    };
    this.drawingService.sendDrawing(data);
    this.context.lineTo(event.offsetX, event.offsetY);
    this.context.stroke();
  }

  @HostListener('mouseup')
  onMouseUp() {
    this.drawing = false;
  }

  onColorChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.currentColor = input.value;
    this.context.strokeStyle = this.currentColor;
  }

  onBrushSizeChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.currentBrushSize = parseInt(input.value, 10);
    this.context.lineWidth = this.currentBrushSize;
  }

  ngOnDestroy() {
    this.drawingService.leaveRoom(this.roomId);
    console.log('drawing canwas is desrroyed');
  }

  private drawFromData(point: DrawingPointMessage) {
    this.currentBrushSize = point.brushSize;
    this.context.lineWidth = this.currentBrushSize;
    this.currentColor = point.color;
    this.context.strokeStyle = this.currentColor;
    if (point.type === 'start') {
      this.context.beginPath();
      this.context.moveTo(point.x, point.y);
    } else if (point.type === 'draw') {
      this.context.lineTo(point.x, point.y);
      this.context.stroke();
    }
  }
}
