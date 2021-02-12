import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { IsUUID } from 'class-validator';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

import { CreateServiceDTO } from './dtos/create-service.dto';

import { ServiceDTO } from './dtos/service.dto';
import { CreateServicePeriodDTO } from './dtos/create-service-period.dto';
import { ServicesService } from './services.service';
import { ServicePeriodDTO } from './dtos/service-period.dto';
import { UpdateServiceDTO } from './dtos/update-service.dto';

export class RefOneParams {
  @IsUUID('all', {
    message: 'O id deve ser um UUID válido',
  })
  id: string;
}

enum TOPICS {
  SERVICES_CREATED = 'services.created',
  SERVICES_UPDATED = 'services.updated',
  SERVICE_PERIODS_CREATED = 'service_periods.created',
}

@ApiTags('services')
@Controller('/v1/services')
export class ServicesController {
  constructor(
    private readonly servicesService: ServicesService,
    @Inject('SERVICES_SERVICE') private client: ClientKafka,
  ) {}

  @Post()
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOperation({ summary: 'Create a service for company' })
  @ApiCreatedResponse({
    description: 'The record has been successfully created.',
    type: ServiceDTO,
  })
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
  @ApiOperation({ summary: 'Create a service period for the service' })
  @ApiParam({
    name: 'id',
    type: 'string',
    example: '3f0a66e5-3886-4f22-9cb1-41c921e62e20',
  })
  @ApiCreatedResponse({
    description: 'The record has been successfully created.',
    type: ServicePeriodDTO,
  })
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
  @ApiOperation({ summary: 'Get a service by ID' })
  @ApiParam({
    name: 'id',
    type: 'string',
    example: '3f0a66e5-3886-4f22-9cb1-41c921e62e20',
  })
  @ApiOkResponse({
    description: 'The record has been successfully returned.',
    type: ServiceDTO,
  })
  async getOne(@Param() params: RefOneParams): Promise<ServiceDTO> {
    const { id } = params;

    const serviceEntity = await this.servicesService.getOne(id);

    return new ServiceDTO(serviceEntity);
  }

  @Patch('/:id')
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOperation({ summary: 'Update a service by ID' })
  @ApiParam({
    name: 'id',
    type: 'string',
    example: '3f0a66e5-3886-4f22-9cb1-41c921e62e20',
  })
  @ApiOkResponse({
    description: 'The record has been successfully updated.',
    type: ServiceDTO,
  })
  async updateOne(
    @Param() params: RefOneParams,
    @Body() updateServiceDto: UpdateServiceDTO,
  ): Promise<ServiceDTO> {
    const { id } = params;

    const serviceEntity = await this.servicesService.updateOne(
      id,
      updateServiceDto,
    );

    await this.client
      .emit(TOPICS.SERVICES_UPDATED, { ...serviceEntity })
      .toPromise();

    return new ServiceDTO(serviceEntity);
  }
}
