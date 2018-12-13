import { Injectable, OnModuleInit } from '@nestjs/common';
import * as io from 'socket.io-client';


@Injectable()
export class AppService implements OnModuleInit {
  socket: SocketIOClient.Socket;
  getHello(): string {
    return 'Hello World!';
  }

  onModuleInit() {




    console.log('sockets start!');




    this.socket = io.connect('wss://ws-feed.prime.coinbase.com', {
      reconnection: true,
    });

    this.socket.on('connection', () => console.log('zalupa')    )


    this.socket.on('connect', () => console.log('Connected!')    );



  }
}
