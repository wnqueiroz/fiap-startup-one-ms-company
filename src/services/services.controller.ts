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
import { ServicesService } from './services.service';

export class FindOneParams {
  @IsUUID('all', {
    message: 'O id deve ser um UUID válido',
  })
  id: string;
}

enum TOPICS {
  SERVICES_CREATED = 'services.created',
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

  @Get('/:id')
  @UseInterceptors(ClassSerializerInterceptor)
  async getOne(@Param() params: FindOneParams): Promise<ServiceDTO> {
    const { id } = params;

    const serviceEntity = await this.servicesService.getOne(id);

    return new ServiceDTO(serviceEntity);
  }
}
