import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CompanyEntity } from './company.entity';
import { ServiceEntity } from '../services/service.entity';
import { CompaniesController } from './companies.controller';
import { CompaniesService } from './companies.service';
import { ServicesModule } from '../services/services.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CompanyEntity, ServiceEntity]),
    ServicesModule,
  ],
  controllers: [CompaniesController],
  providers: [CompaniesService],
})
export class CompaniesModule {}
