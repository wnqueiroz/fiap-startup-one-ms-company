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
}
