import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateServiceDTO } from './dtos/create-service.dto';
import { CreateServicePeriodDTO } from './dtos/create-service-period.dto';

import { ServiceEntity } from './service.entity';
import { CompanyEntity } from '../companies/company.entity';
import { ServicePeriodsEntity } from './service-periods.entity';
import { UpdateServiceDTO } from './dtos/update-service.dto';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(ServiceEntity)
    private servicesRepository: Repository<ServiceEntity>,
    @InjectRepository(CompanyEntity)
    private companiesRepository: Repository<CompanyEntity>,
    @InjectRepository(ServicePeriodsEntity)
    private servicePeriodsRepository: Repository<ServicePeriodsEntity>,
  ) {}

  async getOne(id: string): Promise<ServiceEntity> {
    const serviceEntity = await this.servicesRepository.findOne(id, {
      relations: ['servicePeriods'],
    });

    if (!serviceEntity) throw new NotFoundException('Service not found');

    return serviceEntity;
  }

  async updateOne(
    id: string,
    updateServiceDto: UpdateServiceDTO,
  ): Promise<ServiceEntity> {
    const serviceEntity = await this.getOne(id);

    return this.servicesRepository.save({
      ...serviceEntity,
      ...updateServiceDto,
    });
  }

  async deleteOne(id: string): Promise<ServiceEntity> {
    const serviceEntity = await this.getOne(id);

    return this.servicesRepository.remove(serviceEntity);
  }

  async create(
    idCompany: string,
    createServiceDTO: CreateServiceDTO,
  ): Promise<ServiceEntity> {
    const companyExists = await this.companiesRepository.findOne(idCompany);

    if (!companyExists) throw new NotFoundException('Company not found');

    let serviceEntity = this.servicesRepository.create({
      ...createServiceDTO,
      idCompany,
    });

    serviceEntity = await this.servicesRepository.save(serviceEntity);

    return {
      ...serviceEntity,
      servicePeriods: [],
    };
  }

  async createPeriods(
    idService: string,
    createServicePeriodDTO: CreateServicePeriodDTO,
  ): Promise<ServicePeriodsEntity> {
    const serviceExists = await this.servicesRepository.findOne(idService);

    if (!serviceExists) throw new NotFoundException('Service not found');

    const { startTime } = createServicePeriodDTO;

    const servicePeriod = await this.servicePeriodsRepository.find({
      where: {
        idService,
        startTime,
      },
    });

    const servicePeriodAlreadyExists = servicePeriod && servicePeriod.length;

    if (servicePeriodAlreadyExists)
      throw new UnprocessableEntityException(
        'Service period with start time already exists',
      );

    const servicePeriodEntity = this.servicePeriodsRepository.create({
      ...createServicePeriodDTO,
      idService,
    });

    return this.servicePeriodsRepository.save(servicePeriodEntity);
  }
}
