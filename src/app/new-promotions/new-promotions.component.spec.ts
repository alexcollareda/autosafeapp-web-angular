import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';

import { NewPromotionsComponent } from './new-promotions.component';

// Ajuste os paths se os serviços estiverem em outro lugar
import { ImageService } from '../services/image.service';
import { ServicesService } from '../services/services.service';

describe('NewPromotionsComponent', () => {
  let component: NewPromotionsComponent;
  let fixture: ComponentFixture<NewPromotionsComponent>;

  // Mocks simples
  const imageServiceMock = {
    uploadImage: jasmine.createSpy('uploadImage').and.returnValue(of({ url: 'https://teste/url.png' }))
  };

  const servicesServiceMock = {
    search: jasmine.createSpy('search').and.returnValue(of([]))
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NewPromotionsComponent],
      imports: [
        ReactiveFormsModule,
        HttpClientTestingModule
      ],
      providers: [
        { provide: ImageService, useValue: imageServiceMock },
        { provide: ServicesService, useValue: servicesServiceMock }
      ],
      // Ignora componentes/atributos desconhecidos do template (ex.: ngb-alert)
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(NewPromotionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Exemplo extra: validação de 30 dias
  it('should flag error when date range is > 30 days', () => {
    component.form.patchValue({
      startDate: '2025-01-01',
      endDate:   '2025-02-05' // 36 dias
    });
    fixture.detectChanges();
    expect(component.form.errors?.['rangeMax30']).toBeTrue();
  });

  // Exemplo extra: exigir link quando type = EXTERNAL_LINK
  it('should require externalLink for EXTERNAL_LINK type', () => {
    component.form.patchValue({ type: 'EXTERNAL_LINK', externalLink: '' });
    component.form.updateValueAndValidity();
    const ctrl = component.form.get('externalLink');
    expect(ctrl?.hasError('required')).toBeTrue();
  });
});
