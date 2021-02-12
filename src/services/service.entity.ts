import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';

import { CompanyEntity } from '../companies/company.entity';
import { ServicePeriodsEntity } from './service-periods.entity';

@Entity({
  name: 'services',
})
export class ServiceEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  name: string;

  @Column('uuid', {
    nullable: false,
  })
  idCompany: string;

  @ManyToOne(
    () => CompanyEntity,
    company => company.id,
  )
  @JoinColumn({ name: 'idCompany' })
  company: CompanyEntity;

  @OneToMany(
    () => ServicePeriodsEntity,
    servicePeriod => servicePeriod.service,
  )
  servicePeriods: ServicePeriodsEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
