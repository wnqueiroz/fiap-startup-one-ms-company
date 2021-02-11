import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  Post,
  UseInterceptors,
} from '@nestjs/common';

import { ServiceDTO } from 'src/services/dtos/service.dto';

import { CompaniesService } from './companies.service';
import { CompanyDTO } from './dtos/company.dto';
import { CreateCompanyDTO } from './dtos/create-company.dto';

@Controller('/v1/companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Get()
  @UseInterceptors(ClassSerializerInterceptor)
  async getAll(): Promise<CompanyDTO[]> {
    const companyEntities = await this.companiesService.getAll();

    return companyEntities.map(companyEntity => new CompanyDTO(companyEntity));
  }

  @Get('/:id/services')
  @UseInterceptors(ClassSerializerInterceptor)
  async getAllServices(@Param('id') idCompany: string): Promise<ServiceDTO[]> {
    const servicesEntities = await this.companiesService.getAllServices(
      idCompany,
    );

    return servicesEntities.map(serviceEntity => new ServiceDTO(serviceEntity));
  }

  @Post()
  @UseInterceptors(ClassSerializerInterceptor)
  async create(
    @Body() createCompanyDTO: CreateCompanyDTO,
  ): Promise<CompanyDTO> {
    const companyEntity = await this.companiesService.create(createCompanyDTO);

    return new CompanyDTO(companyEntity);
  }
}
