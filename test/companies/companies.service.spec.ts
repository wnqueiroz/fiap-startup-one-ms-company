import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CompaniesService } from '../../src/companies/companies.service';
import { CompanyEntity } from '../../src/companies/company.entity';
import { CreateCompanyDTO } from '../../src/companies/dtos/create-company.dto';
import { ServiceEntity } from '../../src/services/service.entity';

describe('CompaniesService', () => {
  let companiesService: CompaniesService;
  let companiesRepository: Repository<CompanyEntity>;
  let servicesRepository: Repository<ServiceEntity>;

  const createCompanyDTO: CreateCompanyDTO = {
    name: 'companyName',
    address: 'address',
  };

  const createCompany: CompanyEntity = {
    id: 'uuidCompany',
    name: 'Company Name',
    address: 'Address',
    idUser: 'idUser',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const createService: ServiceEntity = {
    id: 'uuidService',
    name: 'Service Name',
    idCompany: 'idCompany',
    company: createCompany,
    servicePeriods: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        CompaniesService,
        {
          provide: getRepositoryToken(CompanyEntity),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(ServiceEntity),
          useClass: Repository,
        },
      ],
    }).compile();

    companiesService = module.get<CompaniesService>(CompaniesService);
    companiesRepository = module.get<Repository<CompanyEntity>>(
      getRepositoryToken(CompanyEntity),
    );
    servicesRepository = module.get<Repository<ServiceEntity>>(
      getRepositoryToken(ServiceEntity),
    );
  });

  describe('getAll', () => {
    it('should return all created companies', async () => {
      const result = [createCompany];

      jest.spyOn(companiesRepository, 'find').mockResolvedValueOnce(result);

      expect(await companiesService.getAll('idCompany')).toBe(result);
    });
  });

  describe('getAllServces', () => {
    it('should return all available services by company id', async () => {
      const company = createCompany;
      const services = [createService];

      jest.spyOn(companiesRepository, 'findOne').mockResolvedValueOnce(company);
      jest.spyOn(servicesRepository, 'find').mockResolvedValueOnce(services);

      expect(await companiesService.getAllServices('uuidCompany')).toBe(
        services,
      );
    });

    it('should thrown an exception when there is no company', async () => {
      jest.spyOn(companiesRepository, 'findOne').mockResolvedValueOnce(null);

      await expect(
        companiesService.getAllServices('uuidCompany'),
      ).rejects.toThrow('Company not found');
    });
  });

  describe('create', () => {
    it('should create a company given a companyDTO', async () => {
      const company: CompanyEntity = createCompany;

      jest.spyOn(companiesRepository, 'create').mockReturnValueOnce(company);
      jest.spyOn(companiesRepository, 'save').mockResolvedValueOnce(company);

      expect(await companiesService.create('idUser', createCompanyDTO)).toBe(
        company,
      );
    });
  });
});
