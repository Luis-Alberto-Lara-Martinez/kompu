import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Restablecimiento } from './restablecimiento';

describe('Restablecimiento', () => {
  let component: Restablecimiento;
  let fixture: ComponentFixture<Restablecimiento>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Restablecimiento]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Restablecimiento);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
