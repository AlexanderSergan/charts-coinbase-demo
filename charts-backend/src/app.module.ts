import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChartsGateway } from './charts.gateway';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, ChartsGateway],
})
export class AppModule {}
