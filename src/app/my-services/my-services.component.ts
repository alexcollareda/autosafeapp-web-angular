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
  filteredServiceList: Service[] = [];
  filterText: string = '';

  constructor(private router: Router, private servicesService: ServicesService) { }

  ngOnInit(): void {
    this.servicesService.findByCompanyLogged().subscribe(
      (data) => {
        this.serviceList = data;
        this.filteredServiceList = this.serviceList;
      }
    );
  }

  filterServices(): void {
    if (!this.filterText || this.filterText.trim() === '') {
      this.filteredServiceList = this.serviceList;
    } else {
      this.filteredServiceList = this.serviceList.filter(service =>
        service.title.toLowerCase().includes(this.filterText.toLowerCase())
      );
    }
  }

  onFilterChange(searchTerm: string): void {
    this.filterText = searchTerm;
    this.filterServices();
  }

  clearFilter(): void {
    this.filterText = '';
    this.filteredServiceList = this.serviceList;
  }

  criarNovoServico(): void {
    this.router.navigate(['/app/new-services']);
  }

  openNewService(serviceId: number): void {
    this.router.navigate(['/app/new-services'], { queryParams: { serviceId: serviceId } });
  }
}