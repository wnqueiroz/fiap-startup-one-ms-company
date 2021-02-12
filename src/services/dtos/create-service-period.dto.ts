import { ApiProperty } from '@nestjs/swagger';
import { IsMilitaryTime, IsNotEmpty } from 'class-validator';

export class CreateServicePeriodDTO {
  @ApiProperty({
    example: '10:30',
  })
  @IsNotEmpty({
    message: 'Informe o horário de início do perído de atendimento',
  })
  @IsMilitaryTime({
    message: 'formato inválido',
  })
  startTime: string;

  @ApiProperty({
    example: '11:30',
  })
  @IsNotEmpty({
    message: 'Informe o horário de término do perído de atendimento',
  })
  @IsMilitaryTime({
    message: 'formato inválido',
  })
  endTime: string;
}
