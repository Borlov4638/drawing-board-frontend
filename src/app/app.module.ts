import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router';
import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';

import { AppComponent } from './app.component';
import { ImageUploadComponent } from './image-upload/image-upload.component';
import { DrawingCanvasComponent } from './drawing-canvas/drawing-canvas.component';
import { DrawingService } from './drawing.service';
import { ImageS3Service } from './aws/s3-image.service';

const config: SocketIoConfig = { url: 'http://localhost:5024', options: {} };

const routes: Routes = [
  { path: 'upload', component: ImageUploadComponent },
  { path: 'draw/:id', component: DrawingCanvasComponent },
  { path: '', redirectTo: '/upload', pathMatch: 'full' },
];

@NgModule({
  declarations: [AppComponent, ImageUploadComponent, DrawingCanvasComponent],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    RouterModule.forRoot(routes),
    SocketIoModule.forRoot(config),
  ],
  providers: [DrawingService, ImageS3Service],
  bootstrap: [AppComponent],
})
export class AppModule {}
