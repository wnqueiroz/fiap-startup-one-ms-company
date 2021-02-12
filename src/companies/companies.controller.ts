import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

import { ServiceDTO } from '../services/dtos/service.dto';

import { CompaniesService } from './companies.service';
import { CompanyDTO } from './dtos/company.dto';
import { CreateCompanyDTO } from './dtos/create-company.dto';

@ApiTags('companies')
@Controller('/v1/companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

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
  async getAllServices(@Param('id') idCompany: string): Promise<ServiceDTO[]> {
    const servicesEntities = await this.companiesService.getAllServices(
      idCompany,
    );

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
}
