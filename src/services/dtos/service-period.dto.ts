import { ApiProperty } from '@nestjs/swagger';

export class ServicePeriodDTO {
  @ApiProperty({
    example: '3f0a66e5-3886-4f22-9cb1-41c921e62e20',
  })
  id: string;

  @ApiProperty({
    example: '3f0a66e5-3886-4f22-9cb1-41c921e62e20',
  })
  idService: string;

  @ApiProperty({
    example: '11:30',
  })
  startTime: string;

  @ApiProperty({
    example: '12:30',
  })
  endTime: string;

  @ApiProperty({
    example: '2021-02-12T19:16:03.971Z',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2021-02-12T19:16:03.971Z',
  })
  updatedAt: Date;

  constructor(partial: Partial<ServicePeriodDTO>) {
    Object.assign(this, partial);
  }
}
