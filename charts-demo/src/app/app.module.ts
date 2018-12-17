import { BrowserModule } from '@angular/platform-browser'
import { NgModule } from '@angular/core'

import { AppRoutingModule } from './app-routing.module'
import { AppComponent } from './app.component'
import { OhlcComponent } from './components/charts/ohlc/ohlc.component'
import { DepthComponent } from './components/charts/depth/depth.component'

@NgModule({
  declarations: [
    AppComponent,
    OhlcComponent,
    DepthComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule { }
