import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { ServiceEntity } from './service.entity';

@Entity({
  name: 'service_periods',
})
export class ServicePeriodsEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid', {
    nullable: false,
  })
  idService: string;

  @ManyToOne(
    () => ServiceEntity,
    service => service.id,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'idService' })
  service: ServiceEntity;

  @Column('time', {
    nullable: false,
  })
  startTime: string;

  @Column('time', {
    nullable: false,
  })
  endTime: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
