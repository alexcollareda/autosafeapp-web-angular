import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ServicesService } from 'app/services/services.service';

interface Service {
  id: number;
  title: string;
  description: string;
  price: any;
  priceType: string;
  imageUrl: string;
  appliesToAllVehicles: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  companyId: number;
  companyTypeId: number;
  brands: number[];
  models: number[];
}

@Component({
  selector: 'app-my-services',
  templateUrl: './my-services.component.html',
  styleUrls: ['./my-services.component.scss']
})
export class MyServicesComponent implements OnInit {
  serviceList: Service[] = [];

  criarNovoServico() {
    this.router.navigate(['/app/new-services']); // Aqui você pode redirecionar para a página de criação de novos serviços, se necessário.
  }

  constructor(private router: Router, private servicesService: ServicesService) { }

  openNewService(serviceId: number) {
    this.router.navigate(['/app/new-services'], { queryParams: { serviceId: serviceId } }); // Aqui no queryParams você pode passar o id do serviço que deseja abrir, ou qualquer outro parâmetro que queira utilizar na página de serviços.
  }

  ngOnInit(): void {
    this.servicesService.findByCompanyLogged().subscribe(
      (data) => {
        this.serviceList = data;
      }
    );
  }

}
