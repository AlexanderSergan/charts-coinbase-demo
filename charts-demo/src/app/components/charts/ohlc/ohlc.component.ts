import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-ohlc',
  templateUrl: './ohlc.component.html',
  styleUrls: ['./ohlc.component.scss']
})
export class OhlcComponent implements OnInit {

  constructor() { }

  ohlcData = {
    "method": "candleChart",
    "list":
      [{ "amount": "2", "high": "1", "low": "1", "date": "2018-12-06 22:45", "open": "1", "close": "1" },
       { "amount": "6", "high": "2", "low": "0.5", "date": "2018-12-07 07:48", "open": "2", "close": "0.5" },
       { "amount": "2", "high": "1", "low": "1", "date": "2018-12-07 07:49", "open": "1", "close": "1" },
       { "amount": "3", "high": "1", "low": "1", "date": "2018-12-07 07:50", "open": "1", "close": "1" },
       { "amount": "2", "high": "1", "low": "1", "date": "2018-12-08 18:26", "open": "1", "close": "1" },
       { "amount": "2", "high": "1", "low": "1", "date": "2018-12-08 22:29", "open": "1", "close": "1" },
       { "amount": "2", "high": "15", "low": "15", "date": "2018-12-09 07:27", "open": "15", "close": "15" },
       { "amount": "2", "high": "1", "low": "1", "date": "2018-12-09 08:13", "open": "1", "close": "1" },
       { "amount": "36", "high": "12", "low": "12", "date": "2018-12-09 08:21", "open": "12", "close": "12" },
       { "amount": "4", "high": "3", "low": "1", "date": "2018-12-09 10:33", "open": "1", "close": "3" },
       { "amount": "2", "high": "1", "low": "1", "date": "2018-12-09 10:41", "open": "1", "close": "1" },
       { "amount": "2", "high": "1", "low": "1", "date": "2018-12-09 10:43", "open": "1", "close": "1" },
       { "amount": "2", "high": "1", "low": "1", "date": "2018-12-09 10:45", "open": "1", "close": "1" },
       { "amount": "2", "high": "2", "low": "2", "date": "2018-12-09 10:47", "open": "2", "close": "2" },
       { "amount": "2", "high": "1", "low": "1", "date": "2018-12-09 19:05", "open": "1", "close": "1" },
       { "amount": "4", "high": "1", "low": "1", "date": "2018-12-09 20:07", "open": "1", "close": "1" },
       { "amount": "10", "high": "5", "low": "5", "date": "2018-12-09 20:08", "open": "5", "close": "5" },
       { "amount": "2", "high": "3", "low": "3", "date": "2018-12-09 20:17", "open": "3", "close": "3" },
       { "amount": "2", "high": "1", "low": "1", "date": "2018-12-09 20:23", "open": "1", "close": "1" },
       { "amount": "6", "high": "2", "low": "2", "date": "2018-12-09 20:35", "open": "2", "close": "2" },
       { "amount": "2", "high": "1", "low": "1", "date": "2018-12-09 21:15", "open": "1", "close": "1" }]
  }



  ngOnInit() {
  }

}
