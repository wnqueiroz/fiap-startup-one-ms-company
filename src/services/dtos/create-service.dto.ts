import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateServiceDTO {
  @ApiProperty({
    example: 'Cortar Cabelo',
  })
  @IsNotEmpty({
    message: 'Informe o nome do serviço',
  })
  name: string;
}
