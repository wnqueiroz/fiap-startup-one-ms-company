import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ServiceEntity } from '../services/service.entity';
import { ServicesModule } from '../services/services.module';
import { CompaniesController } from './companies.controller';
import { CompaniesService } from './companies.service';
import { CompanyEntity } from './company.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([CompanyEntity, ServiceEntity]),
    ServicesModule,
  ],
  controllers: [CompaniesController],
  providers: [CompaniesService],
})
export class CompaniesModule {}
