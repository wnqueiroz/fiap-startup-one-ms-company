import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CompanyEntity } from '../../src/companies/company.entity';
import { ServiceEntity } from '../../src/services/service.entity';
import { Repository } from 'typeorm';
import { CompaniesService } from '../../src/companies/companies.service';

describe('CompaniesService', () => {
  let companiesService: CompaniesService;
  let companiesRepository: Repository<CompanyEntity>;
  let servicesRepository: Repository<ServiceEntity>;

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

  describe('When getAll is called ', () => {
    it('should return all created companies', async () => {
      const result = [await createCompany()];
      jest.spyOn(companiesRepository, 'find').mockResolvedValueOnce(result);
      expect(await companiesService.getAll()).toBe(result);
    });
  });

  describe('When getAllServces is called', () => {
    it('should return all available services by company id', async () => {
      const company = await createCompany();
      const services = [await createService()];
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

  describe('When create is called', () => {
    it('should create a company given a companyDTO', async () => {
      const company: CompanyEntity = await createCompany();
      const createCompanyRequest = await createCompanyDTO();
      jest.spyOn(companiesRepository, 'create').mockReturnValueOnce(company);
      jest.spyOn(companiesRepository, 'save').mockResolvedValueOnce(company);

      expect(await companiesService.create(createCompanyRequest)).toBe(company);
    });
  });
});

async function createCompanyDTO() {
  return {
    name: 'companyName',
    idUser: 'idUser',
  };
}

async function createCompany() {
  return {
    id: 'uuidCompany',
    name: 'Company Name',
    idUser: 'idUser',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

async function createService() {
  return {
    id: 'uuidService',
    name: 'Service Name',
    idCompany: 'idCompany',
    company: createCompany(),
    servicePeriods: [createServicePeriod()],
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

async function createServicePeriod() {
  return {
    id: 'uuidServicePeriods',
    idService: 'idService',
    service: createService(),
    startTime: '22:30:00',
    endTime: '23:00:00',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}
