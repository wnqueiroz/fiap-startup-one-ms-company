import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CompanyEntity } from '../companies/company.entity';
import { Repository } from 'typeorm';

import { CreateServiceDTO } from './dtos/create-service.dto';
import { ServiceEntity } from './service.entity';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(ServiceEntity)
    private servicesRepository: Repository<ServiceEntity>,
    @InjectRepository(CompanyEntity)
    private companiesRepository: Repository<CompanyEntity>,
  ) {}

  async getOne(id: string): Promise<ServiceEntity> {
    const serviceEntity = await this.servicesRepository.findOne(id);

    if (!serviceEntity) throw new NotFoundException('Service not found');

    return serviceEntity;
  }

  async create(createServiceDTO: CreateServiceDTO): Promise<ServiceEntity> {
    const { idCompany } = createServiceDTO;

    const companyExists = await this.companiesRepository.findOne(idCompany);

    if (!companyExists) throw new NotFoundException('Company not found');

    const serviceEntity = this.servicesRepository.create(createServiceDTO);

    return this.servicesRepository.save(serviceEntity);
  }
}
