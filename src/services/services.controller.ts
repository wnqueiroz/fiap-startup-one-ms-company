import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { IsUUID } from 'class-validator';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

import { ServiceDTO } from './dtos/service.dto';
import { CreateServicePeriodDTO } from './dtos/create-service-period.dto';
import { ServicesService } from './services.service';
import { ServicePeriodDTO } from './dtos/service-period.dto';
import { UpdateServiceDTO } from './dtos/update-service.dto';

import { KAFKA_CLIENTS, KAFKA_TOPICS } from '../contants';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';

export class RefOneParams {
  @IsUUID('all', {
    message: 'O id deve ser um UUID válido',
  })
  id: string;
}

@ApiTags('services')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('/v1/services')
export class ServicesController {
  constructor(
    private readonly servicesService: ServicesService,
    @Inject(KAFKA_CLIENTS.SERVICES_SERVICE) private client: ClientKafka,
  ) {}

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
      .emit(KAFKA_TOPICS.SERVICES_UPDATED, { ...serviceEntity })
      .toPromise();

    return new ServiceDTO(serviceEntity);
  }

  @Delete('/:id')
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOperation({ summary: 'Delete a service by ID' })
  @ApiParam({
    name: 'id',
    type: 'string',
    example: '3f0a66e5-3886-4f22-9cb1-41c921e62e20',
  })
  @ApiOkResponse({
    description: 'The record has been successfully deleted.',
    type: ServiceDTO,
  })
  async deleteOne(@Param() params: RefOneParams): Promise<ServiceDTO> {
    const { id } = params;

    const serviceEntity = await this.servicesService.deleteOne(id);

    await this.client
      .emit(KAFKA_TOPICS.SERVICES_DELETED, { ...serviceEntity })
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
      .emit(KAFKA_TOPICS.SERVICE_PERIODS_CREATED, { ...servicePeriodEntity })
      .toPromise();

    return new ServicePeriodDTO(servicePeriodEntity);
  }
}
