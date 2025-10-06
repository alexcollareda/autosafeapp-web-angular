import { Component, OnInit } from '@angular/core';
import { MetaService } from 'app/services/meta.service';
import * as Rellax from 'rellax';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent implements OnInit {
  data: Date = new Date();
  focus;
  focus1;

  constructor(private metaService: MetaService) { }

  ngOnInit() {
    this.metaService.updatePageMeta({
      title: 'Quem Somos - Autosafe App | Seu Guia Confiável no Mundo Automotivo',
      description: 'Conheça a história do Autosafe App, fundado por Alex Michelim Collareda. Nossa missão é capacitar proprietários de veículos com conhecimento e confiança para decisões automotivas seguras.',
      keywords: 'autosafe app história, alex michelim collareda, quem somos autosafe, missão autosafe, equipe autosafe, plataforma automotiva, confiança automotiva, transparência serviços automotivos',
      canonical: 'https://autosafeapp.com.br/public/landing',
      ogTitle: 'Conheça o Autosafe - Seu Guia Confiável no Mundo Automotivo',
      ogDescription: 'Descubra como o Autosafe nasceu da visão de transformar a experiência automotiva, trazendo transparência e confiança para proprietários de veículos.',
      ogUrl: 'https://autosafeapp.com.br/public/landing'
    });

    // Adicionar dados estruturados específicos
    this.addStructuredData();
    var rellaxHeader = new Rellax('.rellax-header');
  }
  ngOnDestroy() {
    const dynamicScripts = document.querySelectorAll('script[data-dynamic="true"]');
    dynamicScripts.forEach(script => script.remove());
  }

  private addStructuredData() {
    const structuredData = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "AboutPage",
          "@id": "https://autosafeapp.com.br/public/landing#aboutpage",
          "url": "https://autosafeapp.com.br/public/landing",
          "name": "Quem Somos - Autosafe App",
          "description": "Conheça a história, missão e equipe do Autosafe App",
          "inLanguage": "pt-BR",
          "isPartOf": {
            "@type": "WebSite",
            "name": "Autosafe App",
            "url": "https://autosafeapp.com.br/"
          },
          "breadcrumb": {
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://autosafeapp.com.br/"
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "Quem Somos",
                "item": "https://autosafeapp.com.br/public/landing"
              }
            ]
          }
        },
        {
          "@type": "Organization",
          "@id": "https://autosafeapp.com.br/#organization",
          "name": "Autosafe App",
          "url": "https://autosafeapp.com.br/",
          "logo": "https://autosafeapp.com.br/assets/img/logo-as.png",
          "description": "Plataforma digital que conecta proprietários de veículos a prestadores de serviços automotivos especializados",
          "foundingDate": "2024",
          "founder": {
            "@type": "Person",
            "name": "Alex Michelim Collareda",
            "jobTitle": "CEO e Fundador",
            "description": "Engenheiro de software e empreendedor com vasta experiência em tecnologia",
            "sameAs": [
              "https://www.linkedin.com/in/alexcollareda/",
              "https://www.instagram.com/alexcollareda/"
            ]
          },
          "employee": [
            {
              "@type": "Person",
              "name": "Alex Michelim Collareda",
              "jobTitle": "CEO",
              "description": "Empreendedor visionário e engenheiro de software, lidera o Autosafe com inovação, inteligência artificial e foco em impacto real",
              "image": "https://autosafeapp.com.br/assets/img/phalex.jpg",
              "sameAs": [
                "https://www.linkedin.com/in/alexcollareda/",
                "https://www.instagram.com/alexcollareda/"
              ]
            },
            {
              "@type": "Person",
              "name": "José Costa",
              "jobTitle": "COO",
              "description": "Especialista em operações, conecta estratégia e execução, garantindo crescimento escalável e resultados consistentes",
              "image": "https://autosafeapp.com.br/assets/img/phjose.png",
              "sameAs": [
                "https://www.linkedin.com/in/josé-costa-040aa52b2/",
                "https://www.instagram.com/jacost/"
              ]
            },
            {
              "@type": "Person",
              "name": "Gustavo Collareda",
              "jobTitle": "Engenheiro de Software",
              "description": "Engenheiro de software dedicado, transforma tecnologia em soluções práticas, escaláveis e eficientes",
              "image": "https://autosafeapp.com.br/assets/img/phgustavo.jpg",
              "sameAs": [
                "https://www.linkedin.com/in/gustavo-collareda-de-oliveira-santos-492356248/",
                "https://www.instagram.com/_collareda/"
              ]
            }
          ],
          "areaServed": "BR",
          "serviceType": "Plataforma de Serviços Automotivos",
          "sameAs": [
            "https://www.instagram.com/autosafeapp/",
            "https://www.linkedin.com/company/autosafeapp"
          ],
          "contactPoint": {
            "@type": "ContactPoint",
            "contactType": "customer service",
            "email": "contato@autosafeapp.com.br",
            "areaServed": "BR",
            "availableLanguage": "Portuguese"
          }
        },
        {
          "@type": "WebPage",
          "name": "História e Missão Autosafe",
          "description": "Conheça como nasceu o Autosafe e nossa missão de capacitar proprietários de veículos",
          "mainEntity": {
            "@type": "Article",
            "headline": "Autosafe: Seu Guia Confiável no Mundo Automotivo",
            "description": "A história de como o Autosafe nasceu para resolver problemas práticos do dia a dia automotivo",
            "author": {
              "@type": "Person",
              "name": "Alex Michelim Collareda"
            },
            "publisher": {
              "@type": "Organization",
              "name": "Autosafe App",
              "logo": "https://autosafeapp.com.br/assets/img/logo-as.png"
            },
            "datePublished": "2024-01-01",
            "dateModified": "2024-12-30"
          }
        },
        {
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "Quem fundou o Autosafe?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "O Autosafe foi idealizado e fundado por Alex Michelim Collareda, um engenheiro de software e empreendedor com vasta experiência em tecnologia."
              }
            },
            {
              "@type": "Question",
              "name": "Qual é a missão do Autosafe?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Nossa missão é capacitar cada proprietário de veículo com o conhecimento e a confiança necessários para tomar decisões informadas e seguras sobre a saúde e manutenção de seu carro."
              }
            },
            {
              "@type": "Question",
              "name": "Quem faz parte da equipe Autosafe?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Nossa equipe é composta por Alex Collareda (CEO), José Costa (COO) e Gustavo Collareda (Engenheiro de Software), todos dedicados a transformar a experiência automotiva."
              }
            }
          ]
        }
      ]
    };

    // Adicionar o script ao head
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-dynamic', 'true');
    script.text = JSON.stringify(structuredData);
    document.head.appendChild(script);
  }
}
