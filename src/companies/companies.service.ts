import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ServiceEntity } from '../services/service.entity';
import { CompanyEntity } from './company.entity';
import { CreateCompanyDTO } from './dtos/create-company.dto';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(ServiceEntity)
    private servicesRepository: Repository<ServiceEntity>,
    @InjectRepository(CompanyEntity)
    private companiesRepository: Repository<CompanyEntity>,
  ) {}

  getAll(idUser: string): Promise<CompanyEntity[]> {
    return this.companiesRepository.find({
      where: {
        idUser,
      },
    });
  }

  async getAllServices(idCompany: string): Promise<ServiceEntity[]> {
    const companyExists = await this.companiesRepository.findOne(idCompany);

    if (!companyExists) throw new NotFoundException('Company not found');

    return this.servicesRepository.find({
      where: {
        idCompany,
      },
      relations: ['servicePeriods'],
    });
  }

  async create(
    idUser: string,
    createCompanyDTO: CreateCompanyDTO,
  ): Promise<CompanyEntity> {
    const companyEntity = this.companiesRepository.create({
      ...createCompanyDTO,
      idUser,
    });

    return this.companiesRepository.save(companyEntity);
  }
}
