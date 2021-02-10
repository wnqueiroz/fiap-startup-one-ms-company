import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CompanyEntity } from './company.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CompanyEntity])],
})
export class CompaniesModule {}
