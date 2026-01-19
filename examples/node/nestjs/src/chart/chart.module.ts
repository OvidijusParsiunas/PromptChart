import {Module} from '@nestjs/common';
import {ChartController, HealthController} from './chart.controller';
import {ChartService} from './chart.service';

@Module({
  controllers: [ChartController, HealthController],
  providers: [ChartService],
})
export class ChartModule {}
