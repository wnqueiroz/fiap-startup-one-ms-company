import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CompanyEntity } from '../../src/companies/company.entity';
import { KAFKA_CLIENTS, KAFKA_TOPICS } from '../../src/contants';
import { CreateServicePeriodDTO } from '../../src/services/dtos/create-service-period.dto';
import { ServicePeriodDTO } from '../../src/services/dtos/service-period.dto';
import { ServiceDTO } from '../../src/services/dtos/service.dto';
import { UpdateServiceDTO } from '../../src/services/dtos/update-service.dto';
import { ServicePeriodsEntity } from '../../src/services/service-periods.entity';
import { ServiceEntity } from '../../src/services/service.entity';
import { ServicesController } from '../../src/services/services.controller';
import { ServicesService } from '../../src/services/services.service';

describe('ServicesController', () => {
  let serviceEntity: ServiceEntity;
  let servicesService: ServicesService;
  let servicesController: ServicesController;

  const id = 'foo';

  const mockToPromiseClientKafka = jest.fn(async () => null);
  const mockToEmitClientKafka = jest.fn(() => ({
    toPromise: mockToPromiseClientKafka,
  }));

  beforeEach(async () => {
    const MockClientKafka = {
      emit: mockToEmitClientKafka,
    };

    const moduleRef = await Test.createTestingModule({
      controllers: [ServicesController],
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
        {
          provide: KAFKA_CLIENTS.SERVICES_SERVICE,
          useFactory: () => MockClientKafka,
        },
      ],
    }).compile();

    servicesService = moduleRef.get<ServicesService>(ServicesService);
    servicesController = moduleRef.get<ServicesController>(ServicesController);

    serviceEntity = new ServiceEntity();
  });

  describe('getOne', () => {
    it('should return a service by ID', async () => {
      jest
        .spyOn(servicesService, 'getOne')
        .mockImplementation(async () => serviceEntity);

      expect(
        await servicesController.getOne({
          id,
        }),
      ).toStrictEqual(new ServiceDTO(serviceEntity));
    });
  });

  describe('updateOne', () => {
    it('should update a service by ID', async () => {
      const updateServiceDto: UpdateServiceDTO = {
        name: 'Foo',
      };

      jest
        .spyOn(servicesService, 'updateOne')
        .mockImplementation(async () => serviceEntity);

      expect(
        await servicesController.updateOne(
          {
            id,
          },
          updateServiceDto,
        ),
      ).toStrictEqual(new ServiceDTO(serviceEntity));
      expect(servicesService.updateOne).toBeCalledWith(id, updateServiceDto);

      expect(
        mockToEmitClientKafka,
      ).toBeCalledWith(KAFKA_TOPICS.SERVICES_UPDATED, { ...serviceEntity });
      expect(mockToPromiseClientKafka).toBeCalled();
    });
  });

  describe('deleteOne', () => {
    it('should delete a service by ID', async () => {
      jest
        .spyOn(servicesService, 'deleteOne')
        .mockImplementation(async () => serviceEntity);

      expect(
        await servicesController.deleteOne({
          id,
        }),
      ).toStrictEqual(new ServiceDTO(serviceEntity));
      expect(servicesService.deleteOne).toBeCalledWith(id);
      expect(
        mockToEmitClientKafka,
      ).toBeCalledWith(KAFKA_TOPICS.SERVICES_DELETED, { ...serviceEntity });
      expect(mockToPromiseClientKafka).toBeCalled();
    });
  });

  describe('createPeriods', () => {
    it('should create a service period for the service by ID', async () => {
      const createServicePeriodDTO: CreateServicePeriodDTO = {
        startTime: '10:30',
        endTime: '11:30',
      };

      const servicePeriodsEntity = new ServicePeriodsEntity();

      jest
        .spyOn(servicesService, 'createPeriods')
        .mockImplementation(async () => servicePeriodsEntity);

      expect(
        await servicesController.createPeriods(
          {
            id,
          },
          createServicePeriodDTO,
        ),
      ).toStrictEqual(new ServicePeriodDTO(serviceEntity));
      expect(servicesService.createPeriods).toBeCalledWith(
        id,
        createServicePeriodDTO,
      );
      expect(mockToEmitClientKafka).toBeCalledWith(
        KAFKA_TOPICS.SERVICE_PERIODS_CREATED,
        {
          ...servicePeriodsEntity,
        },
      );
      expect(mockToPromiseClientKafka).toBeCalled();
    });
  });
});
