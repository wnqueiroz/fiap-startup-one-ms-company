import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CompanyEntity } from './company.entity';
import { CreateCompanyDTO } from './dtos/create-company.dto';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(CompanyEntity)
    private companiesRepository: Repository<CompanyEntity>,
  ) {}

  getAll(): Promise<CompanyEntity[]> {
    return this.companiesRepository.find();
  }

  async create(createCompanyDTO: CreateCompanyDTO): Promise<CompanyEntity> {
    const companyEntity = this.companiesRepository.create(createCompanyDTO);

    return this.companiesRepository.save(companyEntity);
  }
}
