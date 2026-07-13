import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*', // В продакшене настроить точнее
  },
})
export class EventsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('EventsGateway');

  afterInit(server: Server) {
    this.logger.log('WebSockets Init');
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  // Трансляция события обновления статуса заказа
  broadcastOrderStatusUpdate(orderId: number, status: string) {
    this.server.emit('orderStatusUpdated', { orderId, status });
  }

  // Можно добавить другие события, например обновление координат (если нужно)
}
