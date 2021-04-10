import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CurrentUserDTO } from 'src/auth/dto/current-user.dto';
import { Repository } from 'typeorm';

import { CompaniesController } from '../../src/companies/companies.controller';
import { CompaniesService } from '../../src/companies/companies.service';
import { CompanyEntity } from '../../src/companies/company.entity';
import { CompanyDTO } from '../../src/companies/dtos/company.dto';
import { CreateCompanyDTO } from '../../src/companies/dtos/create-company.dto';
import { KAFKA_CLIENTS, KAFKA_TOPICS } from '../../src/contants';
import { ServiceDTO } from '../../src/services/dtos/service.dto';
import { ServicePeriodsEntity } from '../../src/services/service-periods.entity';
import { ServiceEntity } from '../../src/services/service.entity';
import { ServicesService } from '../../src/services/services.service';

describe('CompaniesController', () => {
  let companiesController: CompaniesController;
  let companiesService: CompaniesService;
  let servicesService: ServicesService;

  const currentUser: CurrentUserDTO = {
    id: 'idUser',
    name: 'userName',
    email: 'userMail',
  };

  const createCompanyDTO: CreateCompanyDTO = {
    name: 'companyName',
    address: 'address',
  };

  const companyEntity: CompanyEntity = {
    id: 'uuidCompany',
    name: 'Company Name',
    address: 'Address',
    idUser: 'idUser',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const serviceEntity: ServiceEntity = {
    id: 'uuidService',
    name: 'Service Name',
    price: 60,
    idCompany: 'idCompany',
    company: companyEntity,
    servicePeriods: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockToPromiseClientKafka = jest.fn(async () => null);
  const mockToEmitClientKafka = jest.fn(() => ({
    toPromise: mockToPromiseClientKafka,
  }));

  beforeEach(async () => {
    const MockClientKafka = {
      emit: mockToEmitClientKafka,
    };

    const moduleRef = await Test.createTestingModule({
      controllers: [CompaniesController],
      providers: [
        CompaniesService,
        ServicesService,
        {
          provide: getRepositoryToken(ServiceEntity),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(CompanyEntity),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(ServicePeriodsEntity),
          useClass: Repository,
        },
        {
          provide: KAFKA_CLIENTS.SERVICES_SERVICE,
          useFactory: () => MockClientKafka,
        },
      ],
    }).compile();

    companiesController = moduleRef.get<CompaniesController>(
      CompaniesController,
    );
    companiesService = moduleRef.get<CompaniesService>(CompaniesService);
    servicesService = moduleRef.get<ServicesService>(ServicesService);
  });

  describe('getAll', () => {
    it('should return a list of companyDTOs', async () => {
      const result = companyEntity;
      const expectedCompanyDTO = new CompanyDTO(result);

      jest
        .spyOn(companiesService, 'getAll')
        .mockImplementation(async () => [result]);

      expect(await companiesController.getAll(currentUser)).toStrictEqual([
        expectedCompanyDTO,
      ]);
    });
  });

  describe('getAllServices', () => {
    it('should return all services by a company id', async () => {
      const services = serviceEntity;
      const expectedServicesDTO = new ServiceDTO(services);

      jest
        .spyOn(companiesService, 'getAllServices')
        .mockImplementation(async () => [services]);

      expect(
        await companiesController.getAllServices({ id: 'idCompany' }),
      ).toStrictEqual([expectedServicesDTO]);
    });
  });

  describe('create', () => {
    it('should return a created company', async () => {
      const company: CompanyEntity = companyEntity;
      const createCompanyRequest = createCompanyDTO;
      const expectedCompanyDTO = new CompanyDTO(company);

      jest
        .spyOn(companiesService, 'create')
        .mockImplementation(async () => company);

      expect(
        await companiesController.create(createCompanyRequest, currentUser),
      ).toStrictEqual(expectedCompanyDTO);
    });
  });

  describe('createService', () => {
    it('should return a created service', async () => {
      const company: CompanyEntity = companyEntity;
      const service = serviceEntity;
      const expectedServiceDTO = new ServiceDTO(service);

      jest
        .spyOn(servicesService, 'create')
        .mockImplementation(async () => service);

      jest
        .spyOn(servicesService, 'getCompany')
        .mockImplementation(async () => company);

      expect(
        await companiesController.createService(
          { id: 'uuidCompany' },
          { name: 'serviceName' },
        ),
      ).toEqual(expectedServiceDTO);
    });

    it('should emit a service created message to the kafka topic', async () => {
      const company: CompanyEntity = companyEntity;
      const service = serviceEntity;

      jest
        .spyOn(servicesService, 'create')
        .mockImplementation(async () => service);

      jest
        .spyOn(servicesService, 'getCompany')
        .mockImplementation(async () => company);

      expect(
        await companiesController.createService(
          { id: 'uuidCompany' },
          { name: 'serviceName' },
        ),
      ).toBeCalled;

      expect(mockToEmitClientKafka).toBeCalledWith(
        KAFKA_TOPICS.SERVICES_CREATED,
        {
          ...service,
          ...{
            companyName: company.name,
            companyAddress: company.address,
          },
        },
      );
      expect(mockToPromiseClientKafka).toBeCalled();
    });
  });
});
