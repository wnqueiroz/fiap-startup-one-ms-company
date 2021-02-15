import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

import { ServiceDTO } from '../services/dtos/service.dto';
import { ServicesService } from '../services/services.service';
import { CreateServiceDTO } from '../services/dtos/create-service.dto';

import { CompanyDTO } from './dtos/company.dto';
import { CompaniesService } from './companies.service';
import { CreateCompanyDTO } from './dtos/create-company.dto';

import { KAFKA_CLIENTS, KAFKA_TOPICS } from '../contants';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';

export class RefOneParams {
  @IsUUID('all', {
    message: 'O id deve ser um UUID válido',
  })
  id: string;
}

@ApiTags('companies')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('/v1/companies')
export class CompaniesController {
  constructor(
    private readonly companiesService: CompaniesService,
    private readonly servicesService: ServicesService,
    @Inject(KAFKA_CLIENTS.SERVICES_SERVICE) private client: ClientKafka,
  ) {}

  @Get()
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOperation({ summary: 'Get all companies' })
  @ApiOkResponse({
    description: 'The record has been successfully returned.',
    type: CompanyDTO,
    isArray: true,
  })
  async getAll(): Promise<CompanyDTO[]> {
    const companyEntities = await this.companiesService.getAll();

    return companyEntities.map(companyEntity => new CompanyDTO(companyEntity));
  }

  @Get('/:id/services')
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOperation({ summary: 'Get all services from company' })
  @ApiParam({
    name: 'id',
    type: 'string',
    example: '3f0a66e5-3886-4f22-9cb1-41c921e62e20',
  })
  @ApiOkResponse({
    description: 'The record has been successfully returned.',
    type: ServiceDTO,
    isArray: true,
  })
  async getAllServices(@Param() params: RefOneParams): Promise<ServiceDTO[]> {
    const { id } = params;

    const servicesEntities = await this.companiesService.getAllServices(id);

    return servicesEntities.map(serviceEntity => new ServiceDTO(serviceEntity));
  }

  @Post()
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOperation({ summary: 'Create a company' })
  @ApiCreatedResponse({
    description: 'The record has been successfully created.',
    type: CompanyDTO,
  })
  async create(
    @Body() createCompanyDTO: CreateCompanyDTO,
  ): Promise<CompanyDTO> {
    const companyEntity = await this.companiesService.create(createCompanyDTO);

    return new CompanyDTO(companyEntity);
  }

  @Post('/:id/services')
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOperation({ summary: 'Create a service for company' })
  @ApiParam({
    name: 'id',
    type: 'string',
    example: '3f0a66e5-3886-4f22-9cb1-41c921e62e20',
  })
  @ApiCreatedResponse({
    description: 'The record has been successfully created.',
    type: ServiceDTO,
  })
  async createService(
    @Param() params: RefOneParams,
    @Body() createServiceDTO: CreateServiceDTO,
  ): Promise<ServiceDTO> {
    const { id } = params;
    const serviceEntity = await this.servicesService.create(
      id,
      createServiceDTO,
    );

    await this.client
      .emit(KAFKA_TOPICS.SERVICES_CREATED, { ...serviceEntity })
      .toPromise();

    return new ServiceDTO(serviceEntity);
  }
}
