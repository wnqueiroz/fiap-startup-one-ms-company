import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { ClientOptions, ClientsModule, Transport } from '@nestjs/microservices';

import { ServiceEntity } from './service.entity';
import { ServicesService } from './services.service';
import { ServicesController } from './services.controller';
import { ServicePeriodsEntity } from './service-periods.entity';

import { CompanyEntity } from '../companies/company.entity';

import { KAFKA_CLIENTS } from '../contants';

const ServicesKafkaClient = ClientsModule.registerAsync([
  {
    name: KAFKA_CLIENTS.SERVICES_SERVICE,
    inject: [ConfigService],
    useFactory: (configService: ConfigService): ClientOptions => {
      const { kafka } = configService.get('app');

      return {
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'ms-company',
            brokers: [`${kafka.host}:${kafka.port}`],
          },
          consumer: {
            groupId: 'ms-company-consumer',
          },
          producer: {
            allowAutoTopicCreation: true,
          },
        },
      };
    },
  },
]);

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ServiceEntity,
      ServicePeriodsEntity,
      CompanyEntity,
      ServicePeriodsEntity,
    ]),
    ServicesKafkaClient,
  ],
  controllers: [ServicesController],
  providers: [ServicesService],
  exports: [ServicesKafkaClient, ServicesService],
})
export class ServicesModule {}
