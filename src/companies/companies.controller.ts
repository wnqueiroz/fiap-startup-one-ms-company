import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Post,
  UseInterceptors,
} from '@nestjs/common';

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

  @Post()
  @UseInterceptors(ClassSerializerInterceptor)
  async create(
    @Body() createCompanyDTO: CreateCompanyDTO,
  ): Promise<CompanyDTO> {
    const companyEntity = await this.companiesService.create(createCompanyDTO);

    return new CompanyDTO(companyEntity);
  }
}
