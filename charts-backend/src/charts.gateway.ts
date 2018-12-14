import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { OnModuleInit } from '@nestjs/common';
import * as Gdax from 'gdax';
import * as socketIo from 'socket.io-client';

@WebSocketGateway(8000, { namespace: 'events' })
export class ChartsGateway implements OnModuleInit {

  @WebSocketServer() server;

  @SubscribeMessage('message')
  handleMessage(client: any, payload: any): string {
    console.log('Server got message: ', payload);
    return 'Hello from server!';
  }

  emitOHLC(message: any) {
    this.server.emit('ohlc', JSON.stringify(message))
  }



  onModuleInit() {
    console.log('sockets start!');

    const websocket = new Gdax.WebsocketClient(['BTC-USD', 'ETH-USD']);

    websocket.on('message', data => this.emitOHLC(data));


  }

}
