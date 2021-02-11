import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateServiceDTO {
  @IsNotEmpty({
    message: 'Informe o nome do serviço',
  })
  name: string;

  @IsNotEmpty({
    message: 'Informe o a empresa onde o serviço é prestado',
  })
  @IsUUID('all', {
    message: 'O idCompany deve ser um UUID válido',
  })
  idCompany: string;
}
