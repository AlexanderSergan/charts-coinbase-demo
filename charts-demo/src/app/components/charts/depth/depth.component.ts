import { Component, OnInit } from '@angular/core'
import * as am4core from '@amcharts/amcharts4/core'
import * as am4charts from '@amcharts/amcharts4/charts'
import am4themes_animated from '@amcharts/amcharts4/themes/animated'



@Component({
  selector: 'app-depth',
  templateUrl: './depth.component.html',
  styleUrls: ['./depth.component.scss'],
  // encapsulation: ViewEncapsulation.None,
})
export class DepthComponent implements OnInit {

  chartLineGreen = '#4c8c54'

  constructor() { }

  container: am4core.Container
  chart: am4charts.XYChart
  ngOnInit() {


    /**
     * Chart container
     */

    this.container = am4core.create('depth-chart-container', am4core.Container)
    this.chart = this.container.createChild(am4charts.XYChart)
    // this.chart.parent = this.container

    this.container.width = am4core.percent(100);
    // this.container.createChild(this.chart)
    this.container.height = am4core.percent(60);






    /* Chart code */
// Themes begin
am4core.useTheme(am4themes_animated)
// Themes end

// Create chart instance

// this.Add data
this.chart.dataSource.url = 'https://poloniex.com/public?command=returnOrderBook&currencyPair=BTC_ETH&depth=50'
this.chart.dataSource.reloadFrequency = 30000
this.chart.dataSource.adapter.add('parsedData', function(data) {

  // Function to process (sort and calculate cummulative volume)
  function processData(list, type, desc) {

    // Convert to data points
    for (let i = 0; i < list.length; i++) {
      list[i] = {
        value: Number(list[i][0]),
        volume: Number(list[i][1]),
      }
    }

    // Sort list just in case
    list.sort(function(a, b) {
      if (a.value > b.value) {
        return 1
      } else if (a.value < b.value) {
        return -1
      } else {
        return 0
      }
    })

    // Calculate cummulative volume
    if (desc) {
      for (let i = list.length - 1; i >= 0; i--) {
        if (i < (list.length - 1)) {
          list[i].totalvolume = list[i + 1].totalvolume + list[i].volume
        } else {
          list[i].totalvolume = list[i].volume
        }
        const dp = {}
        dp['value'] = list[i].value
        dp[type + 'volume'] = list[i].volume
        dp[type + 'totalvolume'] = list[i].totalvolume
        res.unshift(dp)
      }
    } else {
      for (let i = 0; i < list.length; i++) {
        if (i > 0) {
          list[i].totalvolume = list[i - 1].totalvolume + list[i].volume
        } else {
          list[i].totalvolume = list[i].volume
        }
        const dp = {}
        dp['value'] = list[i].value
        dp[type + 'volume'] = list[i].volume
        dp[type + 'totalvolume'] = list[i].totalvolume
        res.push(dp)
      }
    }

  }

  // Init
  const res = []
  processData(data.bids, 'bids', true)
  processData(data.asks, 'asks', false)

  return res
})

// Set up precision for numbers
this.chart.numberFormatter.numberFormat = '#,###.####'

// Create axes
const xAxis = this.chart.xAxes.push(new am4charts.CategoryAxis())
xAxis.dataFields.category = 'value'
// xAxis.renderer.grid.template.location = 0;
xAxis.renderer.minGridDistance = 50
xAxis.title.text = 'Price (BTC/ETH)'

const yAxis = this.chart.yAxes.push(new am4charts.ValueAxis())
yAxis.title.text = 'Volume'

// Create series
const series = this.chart.series.push(new am4charts.StepLineSeries())
series.dataFields.categoryX = 'value'
series.dataFields.valueY = 'bidstotalvolume'
series.strokeWidth = 4
series.stroke = am4core.color(this.chartLineGreen)
series.fill = series.stroke
series.realFill = series.stroke
series.fillOpacity = 0.5
series.tooltipText = 'Ask: [bold]{categoryX}[/]\nTotal volume: [bold]{valueY}[/]\nVolume: [bold]{bidsvolume}[/]'

const series2 = this.chart.series.push(new am4charts.StepLineSeries())
series2.dataFields.categoryX = 'value'
series2.dataFields.valueY = 'askstotalvolume'
series2.strokeWidth = 2
series2.stroke = am4core.color('#f00')
series2.fill = series2.stroke
series2.fillOpacity = 0.1
series2.tooltipText = 'Ask: [bold]{categoryX}[/]\nTotal volume: [bold]{valueY}[/]\nVolume: [bold]{asksvolume}[/]'

const series3 = this.chart.series.push(new am4charts.ColumnSeries())
series3.dataFields.categoryX = 'value'
series3.dataFields.valueY = 'bidsvolume'
series3.strokeWidth = 0
series3.fill = am4core.color('#000')
series3.fillOpacity = 0.2

const series4 = this.chart.series.push(new am4charts.ColumnSeries())
series4.dataFields.categoryX = 'value'
series4.dataFields.valueY = 'asksvolume'
series4.strokeWidth = 0
series4.fill = am4core.color('#000')
series4.fillOpacity = 0.2

// Add cursor
this.chart.cursor = new am4charts.XYCursor()

  }

}
