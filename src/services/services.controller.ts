import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { CreateServiceDTO } from './dtos/create-service.dto';

import { ServiceDTO } from './dtos/service.dto';
import { ServicesService } from './services.service';

@Controller('/v1/services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Post()
  @UseInterceptors(ClassSerializerInterceptor)
  async create(
    @Body() createServiceDTO: CreateServiceDTO,
  ): Promise<ServiceDTO> {
    const serviceEntity = await this.servicesService.create(createServiceDTO);

    return new ServiceDTO(serviceEntity);
  }
}
