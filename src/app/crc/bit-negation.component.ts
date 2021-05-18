import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-bit-negation',
  template: `
    <div *ngIf="_positionToNegate >= 0 && _positionToNegate < crc.length">
      <span>{{crc.substr(0, crc.length - _positionToNegate - 1)}}</span>
      <span style="color: red">{{neg(crc.charAt(crc.length - _positionToNegate - 1))}}</span>
      <span>{{crc.substr(crc.length - _positionToNegate)}}</span>
    </div>
    <div *ngIf="_positionToNegate < 0 || _positionToNegate >= crc.length">
      <span>{{crc}}</span>
    </div>
  `
})
export class BitNegationComponent {

  @Input() crc: string = '';
  @Input() set positionToNegate(value: string) {
    if (isNaN(+value) || value == ''){
      this._positionToNegate = -1;
    } else {
      this._positionToNegate = Number(value);
    }
  }

  _positionToNegate: number = -1;

  neg = (str: string) => (str == '0') ? '1' : '0';

}
