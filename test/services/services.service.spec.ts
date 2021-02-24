import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CompanyEntity } from '../../src/companies/company.entity';
import { ServicePeriodsEntity } from '../../src/services/service-periods.entity';
import { ServiceEntity } from '../../src/services/service.entity';
import { ServicesService } from '../../src/services/services.service';

describe('ServicesService', () => {
  let servicesService: ServicesService;
  let companiesRepository: Repository<CompanyEntity>;
  let servicesRepository: Repository<ServiceEntity>;
  let servicePeriodsRepository: Repository<ServicePeriodsEntity>;

  const companyEntity: CompanyEntity = {
    id: 'uuidCompany',
    name: 'Company Name',
    idUser: 'idUser',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const serviceEntity: ServiceEntity = {
    id: 'uuidService',
    name: 'Service Name',
    idCompany: 'idCompany',
    company: companyEntity,
    servicePeriods: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const servicePeriodsEntity: ServicePeriodsEntity = {
    id: 'uuidServicePeriods',
    idService: 'idService',
    service: serviceEntity,
    startTime: '22:30:00',
    endTime: '23:00:00',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        ServicesService,
        {
          provide: getRepositoryToken(ServiceEntity),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(ServicePeriodsEntity),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(CompanyEntity),
          useClass: Repository,
        },
      ],
    }).compile();

    servicesService = moduleRef.get<ServicesService>(ServicesService);
    companiesRepository = moduleRef.get<Repository<CompanyEntity>>(
      getRepositoryToken(CompanyEntity),
    );
    servicesRepository = moduleRef.get<Repository<ServiceEntity>>(
      getRepositoryToken(ServiceEntity),
    );
    servicePeriodsRepository = moduleRef.get<Repository<ServicePeriodsEntity>>(
      getRepositoryToken(ServicePeriodsEntity),
    );
  });

  describe('getOne', () => {
    it('should get a service by id', async () => {
      const service = serviceEntity;

      jest.spyOn(servicesRepository, 'findOne').mockResolvedValueOnce(service);

      expect(await servicesService.getOne('uuidService')).toStrictEqual(
        service,
      );
    });

    it('should return an error message when service does not exist', async () => {
      jest.spyOn(servicesRepository, 'findOne').mockResolvedValueOnce(null);

      await expect(servicesService.getOne('uuidService')).rejects.toThrow(
        'Service not found',
      );
    });
  });

  describe('updateOne', () => {
    it('should return a updated service by id', async () => {
      const service = serviceEntity;

      jest.spyOn(servicesRepository, 'findOne').mockResolvedValueOnce(service);
      jest.spyOn(servicesRepository, 'save').mockResolvedValueOnce(service);

      expect(
        await servicesService.updateOne('uuidService', { name: 'serviceName' }),
      ).toStrictEqual(service);
    });

    it('should return an error message when service does not exist', async () => {
      jest.spyOn(servicesRepository, 'findOne').mockResolvedValueOnce(null);

      await expect(
        servicesService.updateOne('uuidService', { name: 'serviceName' }),
      ).rejects.toThrow('Service not found');
    });
  });

  describe('deleteOne', () => {
    it('should return a deleted service by id', async () => {
      const service = serviceEntity;

      jest.spyOn(servicesRepository, 'findOne').mockResolvedValueOnce(service);
      jest.spyOn(servicesRepository, 'remove').mockResolvedValueOnce(service);

      expect(await servicesService.deleteOne('uuidService')).toStrictEqual(
        service,
      );
    });

    it('should return an error message when service does not exist', async () => {
      jest.spyOn(servicesRepository, 'findOne').mockResolvedValueOnce(null);

      await expect(servicesService.deleteOne('uuidService')).rejects.toThrow(
        'Service not found',
      );
    });
  });

  describe('create', () => {
    it('it should create a service', async () => {
      const service = serviceEntity;
      const company = companyEntity;

      jest.spyOn(companiesRepository, 'findOne').mockResolvedValueOnce(company);
      jest.spyOn(servicesRepository, 'create').mockReturnValueOnce(service);
      jest.spyOn(servicesRepository, 'save').mockResolvedValueOnce(service);

      expect(
        await servicesService.create('uuidCompany', { name: 'serviceName' }),
      ).toStrictEqual(service);
    });

    it('should return an error message when service does not exist', async () => {
      jest.spyOn(companiesRepository, 'findOne').mockResolvedValueOnce(null);

      await expect(
        servicesService.create('uuidCompany', { name: 'serviceName' }),
      ).rejects.toThrow('Company not found');
    });
  });

  describe('createPeriods', () => {
    it('should create a service periods', async () => {
      const service = serviceEntity;
      const servicePeriod = servicePeriodsEntity;

      jest.spyOn(servicesRepository, 'findOne').mockResolvedValueOnce(service);
      jest.spyOn(servicePeriodsRepository, 'find').mockResolvedValueOnce([]);
      jest
        .spyOn(servicePeriodsRepository, 'create')
        .mockReturnValueOnce(servicePeriod);
      jest
        .spyOn(servicePeriodsRepository, 'save')
        .mockResolvedValueOnce(servicePeriod);

      expect(
        await servicesService.createPeriods('idService', {
          startTime: '22:30',
          endTime: '23:00',
        }),
      ).toStrictEqual(servicePeriod);
    });

    it('should return a message when service does not exist', async () => {
      jest.spyOn(servicesRepository, 'findOne').mockResolvedValueOnce(null);

      await expect(
        servicesService.createPeriods('idService', {
          startTime: '22:30',
          endTime: '23:00',
        }),
      ).rejects.toThrow('Service not found');
    });

    it('should return a message when period already exists', async () => {
      jest
        .spyOn(servicesRepository, 'findOne')
        .mockResolvedValueOnce(serviceEntity);
      jest
        .spyOn(servicePeriodsRepository, 'find')
        .mockResolvedValueOnce([servicePeriodsEntity]);

      await expect(
        servicesService.createPeriods('idService', {
          startTime: '22:30',
          endTime: '23:00',
        }),
      ).rejects.toThrow('Service period with start time already exists');
    });
  });
});
