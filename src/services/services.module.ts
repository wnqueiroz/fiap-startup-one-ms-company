import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ServiceEntity } from './service.entity';
import { ServicesService } from './services.service';
import { ServicesController } from './services.controller';
import { ServicePeriodsEntity } from './service-periods.entity';

import { CompanyEntity } from '../companies/company.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ServiceEntity,
      ServicePeriodsEntity,
      CompanyEntity,
    ]),
  ],
  controllers: [ServicesController],
  providers: [ServicesService],
})
export class ServicesModule {}
