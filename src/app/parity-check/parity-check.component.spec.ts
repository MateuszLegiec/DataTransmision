import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParityCheckComponent } from './parity-check.component';

describe('ParityCheckComponent', () => {
  let component: ParityCheckComponent;
  let fixture: ComponentFixture<ParityCheckComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ParityCheckComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ParityCheckComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
