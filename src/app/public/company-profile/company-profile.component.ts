import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-company-profile',
  templateUrl: './company-profile.component.html',
  styleUrls: ['./company-profile.component.scss']
})
export class CompanyProfileComponent implements OnInit {

  // Dados mockados que simulam uma resposta da API
  company = {
    name: 'Germany Car Service TOP',
    logoUrl: 'assets/img/logo-mock.png', // URL de um logo mockado
    headerImageUrl: 'assets/img/car-service-bg.jpeg', // URL de uma imagem de fundo
    rating: 4,
    description: 'Especialista em carros alemães',
    longDescription: 'Nossa equipe é especializada em diagnósticos precisos e manutenção de veículos premium alemães. Usamos tecnologia de ponta para garantir o melhor serviço para o seu carro. Nosso compromisso é com a qualidade e a transparência em cada reparo.',
    categories: ['Guincho', 'Auto Elétrica', 'Borracharia', 'Pneus', 'Acessórios', 'Oficina'],
    phone: '+55 (65) 99999-9999',
    email: 'contato@germanycar.com.br',
    address: 'Avenida Miguel Sutil, 8920A, Santa Rosa, Cuiabá - MT',
    workingHours: {
      weekdays: '08:00 - 18:00',
      saturday: '08:00 - 12:00',
      sunday: 'Fechado'
    },
    services: [
      {
        name: 'Revisão Completa JEEP',
        description: 'Faça a revisão do seu Jeep com especialistas.',
        price: 999.90,
        imageUrl: 'assets/img/services/jeep-revisao.jpeg',
        category: 'Oficina'
      },
      {
        name: 'Troca de Pneus',
        description: 'Troca e alinhamento de pneus.',
        price: 500.00,
        imageUrl: 'assets/img/services/pneus-bmw.jpeg',
        category: 'Pneus'
      }
      // Adicione mais serviços conforme necessário
    ]
  };

  constructor() { }

  ngOnInit(): void {
    // Por enquanto, não faremos nada aqui, pois os dados são mockados.
    // A lógica de API entrará aqui mais tarde.
  }

  // Método para simular a navegação (opcional)
  navigateTo(url: string) {
    window.open(url, '_blank');
  }
}