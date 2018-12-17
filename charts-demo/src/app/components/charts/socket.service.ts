import { Injectable, OnInit } from '@angular/core'
import { Observable } from 'rxjs'
// import { Observer } from 'rxjs/Observer';
// import { Message } from '../model/message';
// import { Event } from '../model/event';

import * as socketIo from 'socket.io-client'

const SERVER_URL = '0.0.0.0:8000'
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
  public socket

  public initSocket(): void {
      this.socket = socketIo('localhost:8000/events')

      .on('connection', () => {

        console.log('connected to somebody!')
        this.send('privet, server!')
      } )
      // const namespace = this.socket.of('namespace')

  }

  public send(message: any): void {
      this.socket.emit('message', message)
  }


  public onOHLCData(): Observable<any> {
      return new Observable<any>(observer => {
        this.socket.on('ohlc', (data: any) => {
          console.log('Got OHLC data from server!: ', data)
          return observer.next(data)
        })
    })
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
