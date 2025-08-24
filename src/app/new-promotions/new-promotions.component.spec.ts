import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewPromotionsComponent } from './new-promotions.component';

describe('NewPromotionsComponent', () => {
  let component: NewPromotionsComponent;
  let fixture: ComponentFixture<NewPromotionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NewPromotionsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewPromotionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
