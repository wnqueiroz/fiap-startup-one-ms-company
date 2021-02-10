import { Controller, Get } from '@nestjs/common';

import { CompaniesService } from './companies.service';

@Controller('/v1/companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Get()
  getAll(): Promise<any> {
    return this.companiesService.getAll();
  }
}
