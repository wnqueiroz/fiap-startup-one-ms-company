import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateCompanyDTO {
  @IsNotEmpty({
    message: 'Informe o nome da empresa',
  })
  @ApiProperty({
    example: 'Barber Shop S/A',
  })
  name: string;

  @IsNotEmpty({
    message: 'É obrigatório que uma empresa pertença à um usuário',
  })
  @ApiProperty({
    example: '3f0a66e5-3886-4f22-9cb1-41c921e62e20',
  })
  idUser: string;
}
