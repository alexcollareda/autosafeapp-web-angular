import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-my-services',
  templateUrl: './my-services.component.html',
  styleUrls: ['./my-services.component.scss']
})
export class MyServicesComponent implements OnInit {
  criarNovoServico() {
    this.router.navigate(['/app/new-services']); // Aqui você pode redirecionar para a página de criação de novos serviços, se necessário.
  }

  constructor(private router: Router) { }

  openNewService(serviceId: number) {
    this.router.navigate(['/app/new-services'], { queryParams: { serviceId: serviceId } }); // Aqui no queryParams você pode passar o id do serviço que deseja abrir, ou qualquer outro parâmetro que queira utilizar na página de serviços.
  }

  ngOnInit(): void {
  }

}
