import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { SendDrawingInterface } from './intarfaces/send-drawing.interface';
import { Observable } from 'rxjs';
import { DrawingPointMessage } from './types/drawing-point.type';

@Injectable({
  providedIn: 'root',
})
export class DrawingService {
  constructor(private socket: Socket) {}

  joinRoom(room: string) {
    this.socket.emit('joinRoom', room);
  }

  leaveRoom(room: string) {
    this.socket.emit('leaveRoom', room);
  }

  sendDrawing(data: SendDrawingInterface) {
    this.socket.emit('drawing', data);
  }

  getDrawing(): Observable<DrawingPointMessage> {
    return this.socket.fromEvent<DrawingPointMessage>('drawing');
  }

  getHistory(room: string) {
    this.socket.emit('getHistory', room);
  }
}
