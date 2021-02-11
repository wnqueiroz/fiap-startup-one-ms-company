import { IsNotEmpty } from 'class-validator';

export class CreateCompanyDTO {
  @IsNotEmpty({
    message: 'Informe o nome da empresa',
  })
  name: string;

  @IsNotEmpty({
    message: 'É obrigatório que uma empresa pertença à um usuário',
  })
  idUser: string;
}
