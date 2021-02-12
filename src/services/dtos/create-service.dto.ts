import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateServiceDTO {
  @ApiProperty({
    example: 'Cortar Cabelo',
  })
  @IsNotEmpty({
    message: 'Informe o nome do serviço',
  })
  name: string;

  @ApiProperty({
    example: '3f0a66e5-3886-4f22-9cb1-41c921e62e20',
  })
  @IsNotEmpty({
    message: 'Informe o a empresa onde o serviço é prestado',
  })
  @IsUUID('all', {
    message: 'O idCompany deve ser um UUID válido',
  })
  idCompany: string;
}
