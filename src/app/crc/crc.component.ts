import { Component, OnInit } from '@angular/core';

const replaceAt = function(str: string, index: number, replacement: string) {
  return str.substr(0, index) + replacement + str.substr(index + replacement.length);
}

@Component({
  selector: 'app-crc',
  templateUrl: './crc.component.html',
  styleUrls: ['./crc.component.css']
})
export class CrcComponent implements OnInit {
  crcStorage = new CrcStorage();
  selected: CrcModel | null = null;

  constructor() {
  }

  ngOnInit(): void {
  }

  dec2bin = (dec: number) => (dec >>> 0).toString(2);

  strToByteArrayString = (str: string) => {
    let charVal;
    const bytes = [];
    for (let i = 0; i < str.length; i++) {
      charVal = str.charCodeAt(i);
      if (charVal < 256) {
        bytes[i] = this.dec2bin(str.charCodeAt(i));
      }
    }
    return bytes.join('');
  };

  strToEmptyByteArrayString = (value: string) => this.repeat0(this.strToByteArrayString(value).length);

  repeat0 = (len: number) => '0'.repeat(len);

  crcMessage = (crc: CrcModel | null, str: string) => crc ? this.strToByteArrayString(str) + this.dec2bin(crc.calculate(str)) : '';

  negBit = (str: string, bit: any) => {
    let index = str.length - Number(bit) - 1;
    if (index < 0 || index >= str.length) throw Error()
    return (str.charAt(index) === '0') ? replaceAt(str, index, '1') : replaceAt(str, index, '0');
  }

}


class CrcModel {
  readonly width: number;
  readonly name: string;
  readonly polynomial: number;
  readonly polynomialLabel: string;
  private readonly initial: number;
  private readonly finalXor: number;
  private readonly inputReflected: boolean;
  private readonly resultReflected: boolean;
  private readonly msbMask: number;
  readonly crcTable: any[];
  private readonly castMask: number;

  constructor(width: number, name: string, polynomial: number, initial: number, finalXor: number, inputReflected: boolean, resultReflected: boolean, reversed: boolean, polynomialLabel: string) {
    this.width = width;
    this.name = name;
    this.polynomial = polynomial;
    this.initial = initial;
    this.finalXor = finalXor;
    this.inputReflected = inputReflected;
    this.resultReflected = resultReflected;
    this.msbMask = 0x01 << (width - 1);
    this.crcTable = new Array(256);
    this.polynomialLabel = polynomialLabel;

    if (width === 8) this.castMask = 0xFF;
    else if (width === 12) this.castMask = 0xFFF;
    else if (width === 16) this.castMask = 0xFFFF;
    else if (width === 32) this.castMask = 0xFFFFFFFF;
    else throw new Error("Invalid width");


    if (reversed){
      this.calcCrcTableReversed()
    } else {
      this.calcCrcTable();
    }
  }

  calculate(inputText: string) {
    let bytes = this.getCharacterByteArrayFromString(inputText);
    let crc = this.initial;
    for (let i = 0; i < bytes.length; i++) {
      let curByte = bytes[i] & 0xFF;
      if (this.inputReflected) {
        curByte = this.reflect8(curByte);
      }
      crc = (crc ^ (curByte << (this.width - 8))) & this.castMask;
      const pos = (crc >> (this.width - 8)) & 0xFF;
      crc = (crc << 8) & this.castMask;
      crc = (crc ^ this.crcTable[pos]) & this.castMask;
    }

    if (this.resultReflected) {
      crc = this.reflectGeneric(crc, this.width);
    }
    return ((crc ^ this.finalXor) & this.castMask);
  }

  private calcCrcTable() {
    for (let divided = 0; divided < 256; divided++) {
      let currByte = (divided << (this.width - 8)) & this.castMask;
      for (let bit = 0; bit < 8; bit++) {
        if ((currByte & this.msbMask) !== 0) {
          currByte <<= 1;
          currByte ^= this.polynomial;
        } else {
          currByte <<= 1;
        }
      }
      this.crcTable[divided] = (currByte & this.castMask);
    }
  }

  private calcCrcTableReversed() {
    for (let dividend = 0; dividend < 256; dividend++) {
      const reflectedDividend = this.reflect8(dividend);
      let currByte = (reflectedDividend << (this.width - 8)) & this.castMask;
      for (let bit = 0; bit < 8; bit++) {
        if ((currByte & this.msbMask) !== 0) {
          currByte <<= 1;
          currByte ^= this.polynomial;
        } else {
          currByte <<= 1;
        }
      }
      currByte = this.reflectGeneric(currByte, this.width);
      this.crcTable[dividend] = (currByte & this.castMask);
    }
  }

  private reflect8(val: number) {
    let resByte = 0;
    for (let i = 0; i < 8; i++) {
      if ((val & (1 << i)) !== 0) {
        resByte |= ((1 << (7 - i)) & 0xFF);
      }
    }
    return resByte;
  }


  private reflectGeneric(val: number, width: number) {
    let resByte = 0;
    for (let i = 0; i < width; i++) {
      if ((val & (1 << i)) !== 0) {
        resByte |= (1 << ((width - 1) - i));
      }
    }
    return resByte;
  }

  private getCharacterByteArrayFromString(str: string) {
    let charVal;
    const bytes = [];
    for (let i = 0; i < str.length; i++) {
      charVal = str.charCodeAt(i);
      if (charVal < 256) {
        bytes[i] = str.charCodeAt(i);
      }
    }
    return bytes;
  };
}

class CrcStorage {
  private readonly storage: CrcModel[];

  constructor() {
    this.storage = [
      new CrcModel(8, "ATM", 0x07, 0x00, 0x00, false, false, false, "100000111"),
      new CrcModel(12, "CRC_12", 0x80F, 0x00, 0x00, false, false, false, "1100000001111"),
      new CrcModel(16, "CRC_16", 0x8005, 0x00, 0x00, false, false, false, "11000000000000101"),
      new CrcModel(16, "CRC_16_REVERSE", 0x4003, 0x00, 0x55, false, false, false, "10100000000000011"),
      new CrcModel(16, "CRC_ITU", 0x1021, 0x00, 0x00, false, false, false, "10001000000100001"),
      new CrcModel(16, "SDLC",  0x1021, 0x1D0F, 0x0000, false, false, false, "10001000000100001"),
      new CrcModel(16, "SDLC_REVERSE",  0x0811, 0x1D0F, 0x0000, false, false, true, "10000100000010001"),
      new CrcModel(32, "CRC32", 0x04C11DB7, 0xFFFFFFFF, 0xFFFFFFFF, true, true, false, "100000100110000010001110110110111"),
    ];
  }

  getAll() {
    return this.storage;
  }
}
