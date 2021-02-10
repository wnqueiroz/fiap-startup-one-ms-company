import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ServicesModule } from './services/services.module';
import { CompaniesModule } from './companies/companies.module';

import appConfig from './config/app.config';
import databaseConfig from './config/database.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [appConfig, databaseConfig],
      isGlobal: true,
      expandVariables: true,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) =>
        configService.get('database'),
    }),
    ServicesModule,
    CompaniesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
