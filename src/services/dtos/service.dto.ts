export class ServiceDTO {
  constructor(partial: Partial<ServiceDTO>) {
    Object.assign(this, partial);
  }
}
