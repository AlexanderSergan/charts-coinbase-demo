import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { OnModuleInit } from '@nestjs/common';
import * as Gdax from 'gdax';
import * as socketIo from 'socket.io-client';

@WebSocketGateway(8000, { namespace: 'events' })
export class ChartsGateway implements OnModuleInit {

  connection
  constructor() {

  }

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

    this.connection = socketIo.connect('ws://34.247.106.82:8092')

    this.connection.on('connect', (data) => {
      console.log('connected somewhere', data)
      this.subscribeToServer()
    });
    // const websocket = new Gdax.WebsocketClient(['BTC-USD', 'ETH-USD']);

    // websocket.on('message', data => this.emitOHLC(data));


  }


  subscribeToServer() {
    const handshake = {
      "method":"pairSubscribe",
      "pair":"BTC_USD"
    };
    this.connection.emit(handshake)
  }

}
