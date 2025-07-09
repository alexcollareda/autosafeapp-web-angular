import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map, Observable } from 'rxjs';

@Component({
  selector: 'app-new-services',
  templateUrl: './new-services.component.html',
  styleUrls: ['./new-services.component.scss']
})
export class NewServicesComponent implements OnInit {
  serviceId: number | null = null;
  serviceId$: Observable<number | null>;
  constructor(private route: ActivatedRoute) { }

  ngOnInit(): void {
      this.serviceId$ = this.route.paramMap.pipe(
      map(params => +params.get('serviceId')) // Obtém o parâmetro 'id' e converte para número
    );

    this.serviceId$.subscribe(id => {
      this.serviceId = id;
      console.log('ID do serviço recebido (observable):', this.serviceId);
      // Aqui você faria uma chamada a um serviço, por exemplo:
      // this.serviceService.getServiceDetails(this.serviceId).subscribe(data => {
      //   this.serviceDetails = data;
      // });
    });
  }

}
