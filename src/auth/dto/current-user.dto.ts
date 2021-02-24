import { ApiProperty } from '@nestjs/swagger';

export class CurrentUserDTO {
  @ApiProperty({
    example: '00000000-0000-0000-0000-000000000000',
  })
  id: string;

  @ApiProperty({
    example: 'William Queiroz',
  })
  name: string;

  @ApiProperty({
    example: 'lorem@ipsum.com',
  })
  email: string;
}
