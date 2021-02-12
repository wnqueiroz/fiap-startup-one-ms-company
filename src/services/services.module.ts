import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ServiceEntity } from './service.entity';
import { ServicesService } from './services.service';
import { ServicesController } from './services.controller';
import { ServicePeriodsEntity } from './service-periods.entity';

import { CompanyEntity } from '../companies/company.entity';
import { ClientOptions, ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ServiceEntity,
      ServicePeriodsEntity,
      CompanyEntity,
      ServicePeriodsEntity,
    ]),
    ClientsModule.registerAsync([
      {
        name: 'SERVICES_SERVICE',
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
    ]),
  ],
  controllers: [ServicesController],
  providers: [ServicesService],
})
export class ServicesModule {}
