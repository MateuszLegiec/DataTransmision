import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppComponent} from './app.component';
import {BrowserAnimationsModule, NoopAnimationsModule} from '@angular/platform-browser/animations';
import {MatTabsModule} from "@angular/material/tabs";
import { CrcComponent } from './crc/crc.component';
import { HammingComponent } from './hamming/hamming.component';
import { ParityCheckComponent } from './parity-check/parity-check.component';

@NgModule({
  declarations: [
    AppComponent,
    CrcComponent,
    HammingComponent,
    ParityCheckComponent
  ],
  imports: [
    BrowserModule,
    NoopAnimationsModule,
    BrowserAnimationsModule,
    MatTabsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
