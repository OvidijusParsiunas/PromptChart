import { Module } from '@nestjs/common';
import { ChartModule } from './chart/chart.module';

@Module({
  imports: [ChartModule],
})
export class AppModule {}
