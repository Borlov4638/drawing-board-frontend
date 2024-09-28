import { DrawingPointMessage } from '../types/drawing-point.type';

export interface SendDrawingInterface {
  point: DrawingPointMessage;
  room: string;
}
