import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map, Observable } from 'rxjs';

interface CompanyType {
  id: number;
  name: string;
  iconUrl: string | null;
  description: string;
}

interface Service{
    id: number;
    title: string;
    description: string;
    price: number;
    priceType: string;  //EXACT,STARTING_FROM
    imageUrl: string;
    appliesToAllVehicles: boolean;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    companyId: number;
    companyTypeId: number;
    brands: string[];
    models: string[];
}

@Component({
  selector: 'app-new-services',
  templateUrl: './new-services.component.html',
  styleUrls: ['./new-services.component.scss']
})
export class NewServicesComponent implements OnInit {
  serviceId: number | null = null;
  serviceId$: Observable<number | null>;
  companyTypes: CompanyType[] = [];
  service: Service;

  constructor(private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.serviceId = null;
      this.serviceId$ = this.route.paramMap.pipe(
      map(params => +params.get('serviceId')) // Obtém o parâmetro 'id' e converte para número
    );

    this.serviceId$.subscribe(id => {
      this.serviceId = id;
    });
  }

}
