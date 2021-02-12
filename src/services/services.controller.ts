import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { IsUUID } from 'class-validator';

import { CreateServiceDTO } from './dtos/create-service.dto';

import { ServiceDTO } from './dtos/service.dto';
import { CreateServicePeriodDTO } from './dtos/create-service-period.dto';
import { ServicesService } from './services.service';
import { ServicePeriodDTO } from './dtos/service-period.dto';

export class RefOneParams {
  @IsUUID('all', {
    message: 'O id deve ser um UUID válido',
  })
  id: string;
}

enum TOPICS {
  SERVICES_CREATED = 'services.created',
  SERVICE_PERIODS_CREATED = 'service_periods.created',
}

@Controller('/v1/services')
export class ServicesController {
  constructor(
    private readonly servicesService: ServicesService,
    @Inject('SERVICES_SERVICE') private client: ClientKafka,
  ) {}

  @Post()
  @UseInterceptors(ClassSerializerInterceptor)
  async create(
    @Body() createServiceDTO: CreateServiceDTO,
  ): Promise<ServiceDTO> {
    const serviceEntity = await this.servicesService.create(createServiceDTO);

    await this.client
      .emit(TOPICS.SERVICES_CREATED, { ...serviceEntity })
      .toPromise();

    return new ServiceDTO(serviceEntity);
  }

  @Post('/:id/periods')
  @UseInterceptors(ClassSerializerInterceptor)
  async createPeriods(
    @Param() params: RefOneParams,
    @Body() createServicePeriodDTO: CreateServicePeriodDTO,
  ): Promise<ServicePeriodDTO> {
    const { id } = params;

    const servicePeriodEntity = await this.servicesService.createPeriods(
      id,
      createServicePeriodDTO,
    );

    await this.client
      .emit(TOPICS.SERVICE_PERIODS_CREATED, { ...servicePeriodEntity })
      .toPromise();

    return new ServicePeriodDTO(servicePeriodEntity);
  }

  @Get('/:id')
  @UseInterceptors(ClassSerializerInterceptor)
  async getOne(@Param() params: RefOneParams): Promise<ServiceDTO> {
    const { id } = params;

    const serviceEntity = await this.servicesService.getOne(id);

    return new ServiceDTO(serviceEntity);
  }
}
