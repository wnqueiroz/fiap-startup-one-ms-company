import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ServicePeriodsEntity } from './service-periods.entity';
import { ServiceEntity } from './service.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ServiceEntity, ServicePeriodsEntity])],
})
export class ServicesModule {}
