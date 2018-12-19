import { SocketService } from './../socket.service'
import {
  Component,
  OnInit,
  ViewEncapsulation,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core'

import { OhlcDataset } from './ohlc-dataset'
import * as d3 from 'd3'
import * as techan from 'techan'
import { Ohlc } from './ohlc'
import { Observable } from 'rxjs'
import { of } from 'rxjs'
import { from } from 'rxjs'

@Component({
  selector: 'app-ohlc',
  templateUrl: './ohlc.component.html',
  styleUrls: ['./ohlc.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class OhlcComponent implements OnInit, OnChanges {

  socket
  ioConnection
  messages: any[]

  constructor(socket: SocketService) {

    this.socket = socket
  }

  dim: any
  yInit
  yPercentInit
  zoomableInit

  indicatorTop
  parseDate

  zoom

  yPercent

  x
  y
  yVolume
  candlestick
  tradearrow


  sma0
  sma1
  ema2
  volume
  trendline
  supstance
  xAxis
  yAxis
  timeAnnotation
  ohlcAnnotation
  closeAnnotation
  volumeAxis
  percentAxis
  percentAnnotation
  volumeAnnotation
  svg
  defs
  macdScale
  rsiScale
  indicatorSelection


  macd
  macdAxis
  macdAnnotation
  ohlcSelection
  macdAxisLeft
  macdAnnotationLeft

  ohlcCrosshair
  macdCrosshair
  rsiCrosshair

  xGridScale
  yGridScale


  @Input()
  dynamicData: any[]
  dynamicData$: Observable<any>

  dateTimeFormat: string


  ngOnChanges(changes: SimpleChanges) {
    console.log('component changes!', changes.dynamicDScurrentValue);
    this.showD3Chart(changes.dynamicDScurrentValue)

  }

  ngOnInit() {

    // this.dynamicData$ = from(this.dynamicData )

    // this.dynamicData$.subscribe( change => console.log('data changed', change) )


    // this.socket.initSocket()

    // this.socket.send('privet!')
    // this.socket.onOHLCData().subscribe( data => console.log('yeboi ohlc data in the component: ', data))

    this.dateTimeFormat = '%d-%b-%y'  // "23-Dec-13"

    this.dim = {
      width: 960, height: 365,
      margin: { top: 20, right: 50, bottom: 30, left: 50 },
      ohlc: { height: 305 },
      indicator: { height: 65, padding: 5 },
    }

    this.dim.plot = {
      width: this.dim.width - this.dim.margin.left - this.dim.margin.right,
      height: this.dim.height - this.dim.margin.top - this.dim.margin.bottom,
    }
    this.dim.indicator.top = this.dim.ohlc.height + this.dim.indicator.padding
    this.dim.indicator.bottom = this.dim.indicator.top + this.dim.indicator.height + this.dim.indicator.padding

    this.indicatorTop = d3.scaleLinear()
      .range([this.dim.indicator.top, this.dim.indicator.bottom])

    this.parseDate = d3.timeParse(this.dateTimeFormat) //  date: '2018-12-09 21:15','%y-%m-%d %h:%m'

    this.zoom = d3.zoom()
      .on('zoom', this.zoomed.bind(this))

    this.x = techan.scale.financetime()
      .range([0, this.dim.plot.width])

    this.y = d3.scaleLinear()
      .range([this.dim.ohlc.height, 0])



    this.yPercent = this.y.copy()   // Same as y at this stage, will get a different domain later


    this.yVolume = d3.scaleLinear()
      .range([this.y(0), this.y(0.2)])

    this.candlestick = techan.plot.candlestick()
      .xScale(this.x)
      .yScale(this.y)



    this.volume = techan.plot.volume()
      .accessor(this.candlestick.accessor())   // Set the accessor to a ohlc accessor so we get highlighted bars
      .xScale(this.x)
      .yScale(this.yVolume)

    this.trendline = techan.plot.trendline()
      .xScale(this.x)
      .yScale(this.y)

    this.supstance = techan.plot.supstance()
      .xScale(this.x)
      .yScale(this.y)

    this.xAxis = d3.axisBottom(this.x)


    this.timeAnnotation = techan.plot.axisannotation()
      .axis(this.xAxis)
      .orient('bottom')
      .format(d3.timeFormat(this.dateTimeFormat))
      .width(65)
      .translate([0, this.dim.plot.height])

    this.yAxis = d3.axisRight(this.y)


    this.ohlcAnnotation = techan.plot.axisannotation()
    .axis(this.yAxis)
      .orient('right')
      .format(d3.format(',.2f'))
      .translate([this.x(1), 0])


    this.closeAnnotation = techan.plot.axisannotation()
      .axis(this.yAxis)
      .orient('right')
      .accessor(this.candlestick.accessor())
      .format(d3.format(',.2f'))
      .translate([this.x(1), 0])


    this.percentAxis = d3.axisLeft(this.yPercent)
      .tickFormat(d3.format('+.1%'))

    this.percentAnnotation = techan.plot.axisannotation()
      .axis(this.percentAxis)
      .orient('left')

    this.volumeAxis = d3.axisRight(this.yVolume)
      .ticks(3)
      .tickFormat(d3.format(',.3s'))

    this.volumeAnnotation = techan.plot.axisannotation()
      .axis(this.volumeAxis)
      .orient('right')
      .width(35)

      this.svg = d3.select('app-ohlc').append('svg')
      .attr('width', this.dim.width)
      .attr('height', this.dim.height)


      this.svg = this.svg.append('g')
      .attr('transform', 'translate(' + this.dim.margin.left + ',' + this.dim.margin.top + ')')

      // render grid lines

      this.xGridScale = d3.scaleLinear().range([0, this.dim.plot.width])
      this.yGridScale = d3.scaleLinear().range([this.dim.plot.height, 0])

      this.svg.append('g')
      .attr('class', 'grid grid-lines')
      .attr('transform', `translate(0, ${this.dim.plot.height})`)
      .call(this.getXGridlines()
          .tickSize(-this.dim.plot.height)
          .tickFormat(null),
      )

    // add the Y gridlines
    this.svg.append('g')
      .attr('class', 'grid grid-lines')
      .call(this.getYGridlines()
          .tickSize(-this.dim.plot.width)
          .tickFormat(null),
      )

    this.svg.append('text')
      .attr('class', 'symbol')
      .attr('x', 20)
      .text('Coinbase OHLC Candlestick chart')

    this.svg.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0,' + this.dim.plot.height + ')')



    this.defs = this.svg.append('defs')

    this.defs.append('clipPath')
      .attr('id', 'ohlcClip')
      .append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', this.dim.plot.width)
      .attr('height', this.dim.ohlc.height)


    this.defs.selectAll('indicatorClip').data([0, 1])
      .enter()
      .append('clipPath')
      .attr('id', (d, i) => 'indicatorClip-' + i)
      .append('rect')
      .attr('x', 0)
      .attr('y', (d, i) => this.indicatorTop(i))
      .attr('width', this.dim.plot.width)
      .attr('height', this.dim.indicator.height)



    this.ohlcSelection = this.svg.append('g')
      .attr('class', 'ohlc')
      .attr('transform', 'translate(0,0)')

    this.ohlcSelection.append('g')
      .attr('class', 'axis')
      .attr('transform', 'translate(' + this.x(1) + ',0)')
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -12)
      .attr('dy', '.71em')
      .style('text-anchor', 'end')
      .text('Price ($)')



    this.ohlcSelection.append('g')
      .attr('class', 'volume')
      .attr('clip-path', 'url(#ohlcClip)')

    this.ohlcSelection.append('g')
      .attr('class', 'candlestick')
      .attr('clip-path', 'url(#ohlcClip)')


    this.ohlcSelection.append('g')
      .attr('class', 'volume axis')



    this.svg.append('g')
      .attr('class', 'crosshair ohlc')

    this.svg.append('g')
      .attr('class', 'tradearrow')
      .attr('clip-path', 'url(#ohlcClip)')

    this.svg.append('g')
      .attr('class', 'trendlines analysis')
      .attr('clip-path', 'url(#ohlcClip)')
    this.svg.append('g')
      .attr('class', 'supstances analysis')
      .attr('clip-path', 'url(#ohlcClip)')




      this.ohlcCrosshair = techan.plot.crosshair()
      .xScale(this.timeAnnotation.axis().scale())
      .yScale(this.ohlcAnnotation.axis().scale())
      .xAnnotation(this.timeAnnotation)
      .yAnnotation([this.ohlcAnnotation, this.percentAnnotation, this.volumeAnnotation])
      .verticalWireRange([0, this.dim.plot.height])


    this.showD3Chart(this.ohlcData.list)

    /**
     * OnInit function end
    */
  }



  showD3Chart(dataInput) {

    let data: any[]

    const accessor = this.candlestick.accessor(),
      indicatorPreRoll = 5  // Don't show where indicators don't have data

    data = dataInput.map((d) => {
      const obj = {

        date: this.parseDate(d.date),
        open: +d.open,
        high: +d.high,
        low: +d.low,
        close: +d.close,
        volume: +d.amount,

      }
      // console.log('Holla obj: ', obj)
      return obj

    }).sort(function (a, b) { return d3.ascending(accessor.d(a), accessor.d(b)) })

    this.x.domain(techan.scale.plot.time(data).domain())
    this.y.domain(techan.scale.plot.ohlc(data.slice(indicatorPreRoll)).domain())
    this.yPercent.domain(techan.scale.plot.percent(this.y, accessor(data[indicatorPreRoll])).domain())
    this.yVolume.domain(techan.scale.plot.volume(data).domain())


    this.svg.select('g.candlestick').datum(data).call(this.candlestick)

    this.svg.select('g.close.annotation').datum([data[data.length - 1]]).call(this.closeAnnotation)
    this.svg.select('g.volume').datum(data).call(this.volume)
    // this.svg.select('g.sma.ma-0').datum(techan.indicator.sma().period(10)(data)).call(this.sma0)

    this.svg.select('g.crosshair.ohlc').call(this.ohlcCrosshair).call(this.zoom)

    this.zoomableInit = this.x.zoomable().domain([indicatorPreRoll, data.length]).copy() // Zoom in a little to hide indicator preroll
    this.yInit = this.y.copy()
    this.yPercentInit = this.yPercent.copy()

  // .on('mouseout', () => {

  //     // tip.style('display', 'none');
  // })

    this.draw()

  }

  draw() {


    this.svg.select('g.x.axis').call(this.xAxis)
    this.svg.select('g.ohlc .axis').call(this.yAxis)
    this.svg.select('g.volume.axis').call(this.volumeAxis)
    // this.svg.select('g.percent.axis').call(this.percentAxis)

    this.svg.select('g.close.annotation').call(this.closeAnnotation.refresh)
    this.svg.select('g.candlestick').call(this.candlestick.refresh)
    this.svg.select('g.volume').call(this.volume.refresh)

    this.svg.select('g.crosshair.ohlc').call(this.ohlcCrosshair.refresh)
    this.svg.select('g.trendlines').call(this.trendline.refresh)
    this.svg.select('g.supstances').call(this.supstance.refresh)

  }


  reset() {
    this.zoom.scale(1)
    this.zoom.translate([0, 0])
    this.draw()
  }

  zoomed() {
    this.x.zoomable().domain(d3.event.transform.rescaleX(this.zoomableInit).domain())
    this.y.domain(d3.event.transform.rescaleY(this.yInit).domain())
    // this.yPercent.domain(d3.event.transform.rescaleY(this.yPercentInit).domain())
    this.xGridScale.domain(d3.event.transform.rescaleX(this.zoomableInit).domain())


    this.draw()
  }


// gridlines in x axis function
 getXGridlines() {
    return d3.axisBottom(this.xGridScale)
        .ticks(10)
}

// gridlines in y axis function
 getYGridlines() {
    return d3.axisLeft(this.yGridScale)
        .ticks(5)
}


  ohlcData: OhlcDataset = {
    method: 'candleChart',
    list:
      [
        {
          'date': '9-Jun-14',
          'open': 62.4,
          'high': 63.34,
          'low': 61.79,
          'close': 62.88,
          'amount': 37617413,
        },
        {
          'date': '6-Jun-14',
          'open': 63.37,
          'high': 63.48,
          'low': 62.15,
          'close': 62.5,
          'amount': 42442096,
        },
        {
          'date': '5-Jun-14',
          'open': 63.66,
          'high': 64.36,
          'low': 62.82,
          'close': 63.19,
          'amount': 47352368,
        },
        {
          'date': '4-Jun-14',
          'open': 62.45,
          'high': 63.59,
          'low': 62.07,
          'close': 63.34,
          'amount': 36513991,
        },
        {
          'date': '3-Jun-14',
          'open': 62.62,
          'high': 63.42,
          'low': 62.32,
          'close': 62.87,
          'amount': 32216707,
        },
        {
          'date': '2-Jun-14',
          'open': 63.23,
          'high': 63.59,
          'low': 62.05,
          'close': 63.08,
          'amount': 35995537,
        },
        {
          'date': '30-May-14',
          'open': 63.95,
          'high': 64.17,
          'low': 62.56,
          'close': 63.3,
          'amount': 45283577,
        },
        {
          'date': '29-May-14',
          'open': 63.84,
          'high': 64.3,
          'low': 63.51,
          'close': 63.83,
          'amount': 42699670,
        },
        {
          'date': '28-May-14',
          'open': 63.39,
          'high': 64.14,
          'low': 62.62,
          'close': 63.51,
          'amount': 47795088,
        },
        {
          'date': '27-May-14',
          'open': 61.62,
          'high': 63.51,
          'low': 61.57,
          'close': 63.48,
          'amount': 55681663,
        },
        {
          'date': '23-May-14',
          'open': 60.41,
          'high': 61.45,
          'low': 60.15,
          'close': 61.35,
          'amount': 38293993,
        },
        {
          'date': '22-May-14',
          'open': 60.94,
          'high': 61.48,
          'low': 60.4,
          'close': 60.52,
          'amount': 54200116,
        },
        {
          'date': '21-May-14',
          'open': 58.56,
          'high': 60.5,
          'low': 58.25,
          'close': 60.49,
          'amount': 58991505,
        },
        {
          'date': '20-May-14',
          'open': 59.5,
          'high': 60.19,
          'low': 58.18,
          'close': 58.56,
          'amount': 53931469,
        },
        {
          'date': '19-May-14',
          'open': 57.89,
          'high': 59.56,
          'low': 57.57,
          'close': 59.21,
          'amount': 43033925,
        },
        {
          'date': '16-May-14',
          'open': 58.31,
          'high': 58.45,
          'low': 57.31,
          'close': 58.02,
          'amount': 47933075,
        },
        {
          'date': '15-May-14',
          'open': 59.26,
          'high': 59.38,
          'low': 57.52,
          'close': 57.92,
          'amount': 56813940,
        },
        {
          'date': '14-May-14',
          'open': 59.53,
          'high': 60.45,
          'low': 58.95,
          'close': 59.23,
          'amount': 47428583,
        },
        {
          'date': '13-May-14',
          'open': 59.66,
          'high': 60.89,
          'low': 59.51,
          'close': 59.83,
          'amount': 48525476,
        },
        {
          'date': '12-May-14',
          'open': 57.98,
          'high': 59.9,
          'low': 57.98,
          'close': 59.83,
          'amount': 48575487,
        },
        {
          'date': '9-May-14',
          'open': 56.85,
          'high': 57.65,
          'low': 56.38,
          'close': 57.24,
          'amount': 52583858,
        },
        {
          'date': '8-May-14',
          'open': 57.23,
          'high': 58.82,
          'low': 56.5,
          'close': 56.76,
          'amount': 61251053,
        },
        {
          'date': '7-May-14',
          'open': 58.77,
          'high': 59.3,
          'low': 56.26,
          'close': 57.39,
          'amount': 78587247,
        },
        {
          'date': '6-May-14',
          'open': 60.98,
          'high': 61.15,
          'low': 58.49,
          'close': 58.53,
          'amount': 55900809,
        },
        {
          'date': '5-May-14',
          'open': 59.67,
          'high': 61.35,
          'low': 59.18,
          'close': 61.22,
          'amount': 46057411,
        },
        {
          'date': '2-May-14',
          'open': 61.3,
          'high': 61.89,
          'low': 60.18,
          'close': 60.46,
          'amount': 54189197,
        },
        {
          'date': '1-May-14',
          'open': 60.43,
          'high': 62.28,
          'low': 60.21,
          'close': 61.15,
          'amount': 82428606,
        },
        {
          'date': '30-Apr-14',
          'open': 57.58,
          'high': 59.85,
          'low': 57.16,
          'close': 59.78,
          'amount': 76093004,
        },
        {
          'date': '29-Apr-14',
          'open': 56.09,
          'high': 58.28,
          'low': 55.84,
          'close': 58.15,
          'amount': 75557202,
        },
        {
          'date': '28-Apr-14',
          'open': 58.05,
          'high': 58.31,
          'low': 54.66,
          'close': 56.14,
          'amount': 107757756,
        },
        {
          'date': '25-Apr-14',
          'open': 59.97,
          'high': 60.01,
          'low': 57.57,
          'close': 57.71,
          'amount': 92501529,
        },
        {
          'date': '24-Apr-14',
          'open': 63.6,
          'high': 63.65,
          'low': 59.77,
          'close': 60.87,
          'amount': 138769345,
        },
        {
          'date': '23-Apr-14',
          'open': 63.45,
          'high': 63.48,
          'low': 61.26,
          'close': 61.36,
          'amount': 96564750,
        },
        {
          'date': '22-Apr-14',
          'open': 62.65,
          'high': 63.44,
          'low': 62.22,
          'close': 63.03,
          'amount': 60631312,
        },
        {
          'date': '21-Apr-14',
          'open': 59.46,
          'high': 61.24,
          'low': 59.15,
          'close': 61.24,
          'amount': 60363619,
        },
        {
          'date': '17-Apr-14',
          'open': 59.3,
          'high': 60.58,
          'low': 58.72,
          'close': 58.94,
          'amount': 88040346,
        },
        {
          'date': '16-Apr-14',
          'open': 59.79,
          'high': 60.19,
          'low': 57.74,
          'close': 59.72,
          'amount': 78773521,
        },
        {
          'date': '15-Apr-14',
          'open': 59.29,
          'high': 59.68,
          'low': 55.88,
          'close': 59.09,
          'amount': 108622706,
        },
        {
          'date': '14-Apr-14',
          'open': 60.09,
          'high': 60.45,
          'low': 57.78,
          'close': 58.89,
          'amount': 72324603,
        },
        {
          'date': '11-Apr-14',
          'open': 57.6,
          'high': 60.31,
          'low': 57.31,
          'close': 58.53,
          'amount': 91451960,
        },
        {
          'date': '10-Apr-14',
          'open': 63.08,
          'high': 63.18,
          'low': 58.68,
          'close': 59.16,
          'amount': 114987616,
        },
        {
          'date': '9-Apr-14',
          'open': 59.63,
          'high': 62.46,
          'low': 59.19,
          'close': 62.41,
          'amount': 100215307,
        },
        {
          'date': '8-Apr-14',
          'open': 57.68,
          'high': 58.71,
          'low': 57.17,
          'close': 58.19,
          'amount': 78835935,
        },
        {
          'date': '7-Apr-14',
          'open': 55.9,
          'high': 58,
          'low': 55.44,
          'close': 56.95,
          'amount': 108487569,
        },
        {
          'date': '4-Apr-14',
          'open': 59.94,
          'high': 60.2,
          'low': 56.32,
          'close': 56.75,
          'amount': 125465774,
        },
        {
          'date': '3-Apr-14',
          'open': 62.55,
          'high': 63.17,
          'low': 59.13,
          'close': 59.49,
          'amount': 83859330,
        },
        {
          'date': '2-Apr-14',
          'open': 63.21,
          'high': 63.91,
          'low': 62.21,
          'close': 62.72,
          'amount': 66276613,
        },
        {
          'date': '1-Apr-14',
          'open': 60.46,
          'high': 62.66,
          'low': 60.24,
          'close': 62.62,
          'amount': 59291210,
        },
        {
          'date': '31-Mar-14',
          'open': 60.78,
          'high': 61.52,
          'low': 59.87,
          'close': 60.24,
          'amount': 53011205,
        },
        {
          'date': '28-Mar-14',
          'open': 61.34,
          'high': 61.95,
          'low': 59.34,
          'close': 60.01,
          'amount': 67051528,
        },
        {
          'date': '27-Mar-14',
          'open': 60.51,
          'high': 61.9,
          'low': 57.98,
          'close': 60.97,
          'amount': 112649694,
        },
        {
          'date': '26-Mar-14',
          'open': 64.74,
          'high': 64.95,
          'low': 60.37,
          'close': 60.38,
          'amount': 97689774,
        },
        {
          'date': '25-Mar-14',
          'open': 64.89,
          'high': 66.19,
          'low': 63.78,
          'close': 64.89,
          'amount': 68785500,
        },
        {
          'date': '24-Mar-14',
          'open': 67.19,
          'high': 67.36,
          'low': 63.36,
          'close': 64.1,
          'amount': 85695872,
        },
        {
          'date': '21-Mar-14',
          'open': 67.53,
          'high': 67.92,
          'low': 66.18,
          'close': 67.24,
          'amount': 60041228,
        },
        {
          'date': '20-Mar-14',
          'open': 68.01,
          'high': 68.23,
          'low': 66.82,
          'close': 66.97,
          'amount': 44438500,
        },
        {
          'date': '19-Mar-14',
          'open': 69.17,
          'high': 69.29,
          'low': 67.46,
          'close': 68.24,
          'amount': 43980558,
        },
        {
          'date': '18-Mar-14',
          'open': 68.76,
          'high': 69.6,
          'low': 68.3,
          'close': 69.19,
          'amount': 40827226,
        },
        {
          'date': '17-Mar-14',
          'open': 68.18,
          'high': 68.95,
          'low': 66.62,
          'close': 68.74,
          'amount': 52196699,
        },
        {
          'date': '14-Mar-14',
          'open': 68.49,
          'high': 69.43,
          'low': 67.46,
          'close': 67.72,
          'amount': 48226824,
        },
        {
          'date': '13-Mar-14',
          'open': 71.29,
          'high': 71.35,
          'low': 68.15,
          'close': 68.83,
          'amount': 57091157,
        },
        {
          'date': '12-Mar-14',
          'open': 69.86,
          'high': 71.35,
          'low': 69,
          'close': 70.88,
          'amount': 46400431,
        },
        {
          'date': '11-Mar-14',
          'open': 72.5,
          'high': 72.59,
          'low': 69.96,
          'close': 70.1,
          'amount': 59615238,
        },
        {
          'date': '10-Mar-14',
          'open': 70.77,
          'high': 72.15,
          'low': 70.51,
          'close': 72.03,
          'amount': 59949746,
        },
        {
          'date': '7-Mar-14',
          'open': 71.08,
          'high': 71.18,
          'low': 69.47,
          'close': 69.8,
          'amount': 38985763,
        },
        {
          'date': '6-Mar-14',
          'open': 71.88,
          'high': 71.89,
          'low': 70.25,
          'close': 70.84,
          'amount': 46126260,
        },
        {
          'date': '5-Mar-14',
          'open': 69.69,
          'high': 71.97,
          'low': 69.62,
          'close': 71.57,
          'amount': 74649486,
        },
        {
          'date': '4-Mar-14',
          'open': 68.66,
          'high': 68.9,
          'low': 67.62,
          'close': 68.8,
          'amount': 42164222,
        },
        {
          'date': '3-Mar-14',
          'open': 66.96,
          'high': 68.05,
          'low': 66.51,
          'close': 67.41,
          'amount': 56900444,
        },
        {
          'date': '28-Feb-14',
          'open': 69.47,
          'high': 69.88,
          'low': 67.38,
          'close': 68.46,
          'amount': 66900863,
        },
        {
          'date': '27-Feb-14',
          'open': 69.34,
          'high': 70.01,
          'low': 68.87,
          'close': 68.94,
          'amount': 41695855,
        },
        {
          'date': '26-Feb-14',
          'open': 70.19,
          'high': 71.22,
          'low': 68.85,
          'close': 69.26,
          'amount': 55400399,
        },
        {
          'date': '25-Feb-14',
          'open': 70.95,
          'high': 71,
          'low': 69.45,
          'close': 69.85,
          'amount': 52189031,
        },
        {
          'date': '24-Feb-14',
          'open': 68.74,
          'high': 71.44,
          'low': 68.54,
          'close': 70.78,
          'amount': 76951946,
        },
        {
          'date': '21-Feb-14',
          'open': 69.69,
          'high': 69.96,
          'low': 68.45,
          'close': 68.59,
          'amount': 70991892,
        },
        {
          'date': '20-Feb-14',
          'open': 67.73,
          'high': 70.11,
          'low': 65.73,
          'close': 69.63,
          'amount': 131043748,
        },
        {
          'date': '19-Feb-14',
          'open': 67.05,
          'high': 69.08,
          'low': 67,
          'close': 68.06,
          'amount': 64258631,
        },
        {
          'date': '18-Feb-14',
          'open': 66.94,
          'high': 67.54,
          'low': 66.07,
          'close': 67.3,
          'amount': 43862297,
        },
        {
          'date': '14-Feb-14',
          'open': 67.5,
          'high': 67.58,
          'low': 66.72,
          'close': 67.09,
          'amount': 36786427,
        },
        {
          'date': '13-Feb-14',
          'open': 64.18,
          'high': 67.33,
          'low': 64.05,
          'close': 67.33,
          'amount': 62013396,
        },
        {
          'date': '12-Feb-14',
          'open': 64.92,
          'high': 65.06,
          'low': 64.05,
          'close': 64.45,
          'amount': 47409857,
        },
        {
          'date': '11-Feb-14',
          'open': 63.75,
          'high': 65,
          'low': 63.35,
          'close': 64.85,
          'amount': 45746832,
        },
        {
          'date': '10-Feb-14',
          'open': 64.3,
          'high': 64.49,
          'low': 63.47,
          'close': 63.55,
          'amount': 43736562,
        },
        {
          'date': '7-Feb-14',
          'open': 62.27,
          'high': 64.57,
          'low': 62.22,
          'close': 64.32,
          'amount': 60835746,
        },
        {
          'date': '6-Feb-14',
          'open': 61.46,
          'high': 62.78,
          'low': 61.46,
          'close': 62.16,
          'amount': 42153754,
        },
        {
          'date': '5-Feb-14',
          'open': 62.74,
          'high': 63.16,
          'low': 61.27,
          'close': 62.19,
          'amount': 53032420,
        },
        {
          'date': '4-Feb-14',
          'open': 62.05,
          'high': 63.14,
          'low': 61.82,
          'close': 62.75,
          'amount': 46064897,
        },
        {
          'date': '3-Feb-14',
          'open': 63.03,
          'high': 63.77,
          'low': 60.7,
          'close': 61.48,
          'amount': 75105994,
        },
        {
          'date': '31-Jan-14',
          'open': 60.47,
          'high': 63.37,
          'low': 60.17,
          'close': 62.57,
          'amount': 87930298,
        },
        {
          'date': '30-Jan-14',
          'open': 62.12,
          'high': 62.5,
          'low': 60.46,
          'close': 61.08,
          'amount': 150438699,
        },
        {
          'date': '29-Jan-14',
          'open': 54.61,
          'high': 54.95,
          'low': 53.19,
          'close': 53.53,
          'amount': 98089932,
        },
        {
          'date': '28-Jan-14',
          'open': 54.02,
          'high': 55.28,
          'low': 54,
          'close': 55.14,
          'amount': 48364998,
        },
        {
          'date': '27-Jan-14',
          'open': 54.73,
          'high': 54.94,
          'low': 51.85,
          'close': 53.55,
          'amount': 74142331,
        },
        {
          'date': '24-Jan-14',
          'open': 56.15,
          'high': 56.42,
          'low': 54.4,
          'close': 54.45,
          'amount': 55545338,
        },
        {
          'date': '23-Jan-14',
          'open': 56.37,
          'high': 56.68,
          'low': 55.69,
          'close': 56.63,
          'amount': 47996403,
        },
        {
          'date': '22-Jan-14',
          'open': 58.85,
          'high': 59.31,
          'low': 57.1,
          'close': 57.51,
          'amount': 61495880,
        },
        {
          'date': '21-Jan-14',
          'open': 56.6,
          'high': 58.58,
          'low': 56.5,
          'close': 58.51,
          'amount': 48734147,
        },
        {
          'date': '17-Jan-14',
          'open': 57.3,
          'high': 57.82,
          'low': 56.07,
          'close': 56.3,
          'amount': 40883205,
        },
        {
          'date': '16-Jan-14',
          'open': 57.26,
          'high': 58.02,
          'low': 56.83,
          'close': 57.19,
          'amount': 34599775,
        },
        {
          'date': '15-Jan-14',
          'open': 57.98,
          'high': 58.57,
          'low': 57.27,
          'close': 57.6,
          'amount': 33730619,
        },
        {
          'date': '14-Jan-14',
          'open': 56.46,
          'high': 57.78,
          'low': 56.1,
          'close': 57.74,
          'amount': 37590987,
        },
        {
          'date': '13-Jan-14',
          'open': 57.91,
          'high': 58.25,
          'low': 55.38,
          'close': 55.91,
          'amount': 63106519,
        },
        {
          'date': '10-Jan-14',
          'open': 57.13,
          'high': 58.3,
          'low': 57.06,
          'close': 57.94,
          'amount': 42529258,
        },
        {
          'date': '9-Jan-14',
          'open': 58.65,
          'high': 58.96,
          'low': 56.65,
          'close': 57.22,
          'amount': 92349222,
        },
        {
          'date': '8-Jan-14',
          'open': 57.6,
          'high': 58.41,
          'low': 57.23,
          'close': 58.23,
          'amount': 56800776,
        },
        {
          'date': '7-Jan-14',
          'open': 57.7,
          'high': 58.55,
          'low': 57.22,
          'close': 57.92,
          'amount': 77329009,
        },
        {
          'date': '6-Jan-14',
          'open': 54.42,
          'high': 57.26,
          'low': 54.05,
          'close': 57.2,
          'amount': 68974359,
        },
        {
          'date': '3-Jan-14',
          'open': 55.02,
          'high': 55.65,
          'low': 54.53,
          'close': 54.56,
          'amount': 38287706,
        },
        {
          'date': '2-Jan-14',
          'open': 54.83,
          'high': 55.22,
          'low': 54.19,
          'close': 54.71,
          'amount': 43257622,
        },
        {
          'date': '31-Dec-13',
          'open': 54.12,
          'high': 54.86,
          'low': 53.91,
          'close': 54.65,
          'amount': 43152127,
        },
        {
          'date': '30-Dec-13',
          'open': 54.93,
          'high': 55.18,
          'low': 53.43,
          'close': 53.71,
          'amount': 68307317,
        },
        {
          'date': '27-Dec-13',
          'open': 57.48,
          'high': 57.68,
          'low': 55.25,
          'close': 55.44,
          'amount': 60465751,
        },
        {
          'date': '26-Dec-13',
          'open': 58.32,
          'high': 58.38,
          'low': 57.37,
          'close': 57.73,
          'amount': 55101367,
        },
        {
          'date': '24-Dec-13',
          'open': 58.27,
          'high': 58.58,
          'low': 56.91,
          'close': 57.96,
          'amount': 46617754,
        },
        {
          'date': '23-Dec-13',
          'open': 55.5,
          'high': 58.32,
          'low': 55.45,
          'close': 57.77,
          'amount': 98296983,
        },
      ]
    ,

  }

}
