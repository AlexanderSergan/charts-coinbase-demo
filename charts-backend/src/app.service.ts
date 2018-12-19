import { Injectable } from '@nestjs/common';
// import * as io from 'socket.io-client';
// import * as proxy from 'socket.io-proxy';
// import * as Gdax from 'gdax';

@Injectable()
export class AppService {
  socket: SocketIOClient.Socket;
  getHello(): string {
    return 'Hello World!';
  }

}
