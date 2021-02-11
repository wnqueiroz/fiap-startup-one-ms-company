import { Exclude } from 'class-transformer';

export class CompanyDTO {
  id: string;

  name: string;

  @Exclude()
  idUser: string;

  constructor(partial: Partial<CompanyDTO>) {
    Object.assign(this, partial);
  }
}
