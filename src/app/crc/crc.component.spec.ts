import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrcComponent } from './crc.component';

describe('CrcComponent', () => {
  let component: CrcComponent;
  let fixture: ComponentFixture<CrcComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CrcComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CrcComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
