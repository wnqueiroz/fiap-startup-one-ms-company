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
        'Service period with startTime already exists',
      );

    const servicePeriodEntity = this.servicePeriodsRepository.create({
      ...createServicePeriodDTO,
      idService,
    });

    return this.servicePeriodsRepository.save(servicePeriodEntity);
  }
}
