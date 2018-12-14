import { Injectable, OnInit } from '@angular/core'
import { Observable } from 'rxjs'
// import { Observer } from 'rxjs/Observer';
// import { Message } from '../model/message';
// import { Event } from '../model/event';

import * as socketIo from 'socket.io-client'

const SERVER_URL = 'wss://ws-feed.pro.coinbase.com'
@Injectable({
  providedIn: 'root',
})
export class SocketService implements OnInit {


  ngOnInit(): void {
    // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    // Add 'implements OnInit' to the class.
    // this.onMessage.
  }

  constructor() { }
  private socket

  public initSocket(): void {
      this.socket = socketIo(SERVER_URL)
  }

  public send(message: any): void {
      this.socket.emit('message', message)
  }

  public onMessage(): Observable<any> {
      return new Observable<any>(observer => {
          this.socket.on('message', (data: any) => observer.next(data))
      })
  }

  public onEvent(event: Event): Observable<any> {
      return new Observable<Event>(observer => {
          this.socket.on(event, () => observer.next())
      })
  }

}
