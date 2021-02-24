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

import { GetCurrentUser } from '../auth/auth.annotation';
import { CurrentUserDTO } from '../auth/dto/current-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { KAFKA_CLIENTS, KAFKA_TOPICS } from '../contants';
import { CreateServiceDTO } from '../services/dtos/create-service.dto';
import { ServiceDTO } from '../services/dtos/service.dto';
import { ServicesService } from '../services/services.service';
import { CompaniesService } from './companies.service';
import { CompanyDTO } from './dtos/company.dto';
import { CreateCompanyDTO } from './dtos/create-company.dto';

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
  async getAll(@GetCurrentUser() user: CurrentUserDTO): Promise<CompanyDTO[]> {
    const { id } = user;

    const companyEntities = await this.companiesService.getAll(id);

    return companyEntities.map(companyEntity => new CompanyDTO(companyEntity));
  }

  @Get('/:id/services')
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOperation({ summary: 'Get all services from company' })
  @ApiParam({
    name: 'id',
    type: 'string',
    example: '00000000-0000-0000-0000-000000000000',
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
    @GetCurrentUser() user: CurrentUserDTO,
  ): Promise<CompanyDTO> {
    const { id } = user;

    const companyEntity = await this.companiesService.create(
      id,
      createCompanyDTO,
    );

    return new CompanyDTO(companyEntity);
  }

  @Post('/:id/services')
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOperation({ summary: 'Create a service for company' })
  @ApiParam({
    name: 'id',
    type: 'string',
    example: '00000000-0000-0000-0000-000000000000',
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
