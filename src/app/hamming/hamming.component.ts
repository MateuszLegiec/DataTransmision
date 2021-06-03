import {Component, Input, OnInit} from '@angular/core';
import {parse} from "@angular/compiler/src/render3/view/style_parser";

@Component({
  selector: 'app-hamming',
  templateUrl: './hamming.component.html',
  styleUrls: ['../app.component.css']
})
export class HammingComponent implements OnInit {

  inputText: string = '';
  inputError: string = '';
  byteArrayString: string = '';
  encodedData: string = '';
  encodedDataWithErrors: string = '';
  errorsPositions: Array<boolean> = [];
  fixedData: string = '';
  fixedErrorsPositions: Array<boolean> = [];
  decodedData: string = '';
  decodedErrorsPositions: Array<boolean> = [];
  outputText: string = '';

  constructor() {
  }

  ngOnInit(): void {
  }

  saveInputText = (str: string) => {
    this.inputText = str;
    this.inputError = '';
    this.calculateAll();
  }

  saveInputError = (str: string) => {
    this.inputError = str;
    this.encodedDataWithErrors = this.setErrors(this.encodedData, this.inputError);
    this.calculateErrors();
  }

  calculateAll = () => {
    this.byteArrayString = this.strToByteArrayString(this.inputText);
    this.encodedData = this.encodeHamming(this.byteArrayString);
    this.encodedDataWithErrors = this.setErrors(this.encodedData, this.inputError);
    this.calculateErrors();
  }

  calculateErrors = () => {
    this.fixedData = this.fixErrors(this.encodedDataWithErrors);
    this.decodedData = this.decodeHamming(this.fixedData);
    this.decodedErrorsPositions = this.checkDecoded(this.byteArrayString, this.decodedData);
    this.outputText = this.ByteArrayStringToString(this.decodedData);
  }

  dec2bin = (dec: number) => (dec >>> 0).toString(2);

  strToByteArrayString = (str: string) => {
    let charVal;
    const bytes = [];
    for (let i = 0; i < str.length; i++) {
      charVal = str.charCodeAt(i);
      if (charVal < 256) {
        bytes[i] = this.dec2bin(str.charCodeAt(i));
        while (bytes[i].length < 8) {
          bytes[i] = '0' + bytes[i];
        }
      }
    }
    return bytes.join('');
  };

  ByteArrayStringToString = (str: string) => {
    let decodedText = '';
    let temp = '';
    for (let i = 0; i < str.length; i++) {
      temp += str[i];
      if ((i + 1) % 8 === 0) {
        decodedText += String.fromCharCode(parseInt(temp, 2));
        temp = '';
      }
    }
    return decodedText;
  }

  encodeHamming = (str: string) => {
    let redundancy = 0, sum = 0, i = 0;
    while (i < str.length) {
      if (Math.pow(2, redundancy) - 1 === sum)
        redundancy++;
      else i++;
      sum++;
    }
    let codedData = new Array(sum);
    redundancy = 0;
    sum = 0;
    i = 0;
    let mask = 0;
    while (i < str.length) {
      if (Math.pow(2, redundancy) - 1 === sum)
        redundancy++;
      else {
        codedData[sum] = str[i];
        if (str[i] === '1')
          mask ^= sum + 1;
        i++;
      }
      sum++;
    }
    redundancy = 0;
    for (let i = 0; i < sum; i++) {
      if (Math.pow(2, redundancy) - 1 === i) {
        if ((mask & (1 << redundancy)) === 0)
          codedData[i] = '0';
        else
          codedData[i] = '1';
        redundancy++;
      }
    }
    return codedData.join('');
  }

  decodeHamming = (str: string) => {
    let sum = 0, redundancy = 0;
    for (let i = 0; i < str.length; i++) {
      if (Math.pow(2, redundancy) - 1 !== i)
        sum++;
      else redundancy++;
    }
    let decodedData = new Array(sum);
    sum = 0;
    redundancy = 0;
    for (let i = 0; i < str.length; i++) {
      if (Math.pow(2, redundancy) - 1 !== i) {
        decodedData[sum] = str[i];
        sum++;
      } else redundancy++;
    }
    return decodedData.join('');
  }

  checkDecoded = (str1: string, str2: string) => {
    let errors = [];
    for (let i = 0; i < str1.length; i++) {
      errors[i] = str1[i] !== str2[i];
    }
    return errors;
  }

  setError = (index: number) => {
    let dataWithErrors = this.encodedDataWithErrors.split('');
    dataWithErrors[index] = this.encodedDataWithErrors[index] === '0' ? '1' : '0';
    this.errorsPositions[index] = !this.errorsPositions[index];
    this.encodedDataWithErrors = dataWithErrors.join('');
    this.calculateErrors();
  }

  setErrors = (str: string, n: string) => {
    let dataWithErrors = str.split('');
    this.errorsPositions = new Array(str.length).fill(false);
    if (n) {
      let k = parseInt(n);
      let position = 0, changed = 0;
      if (k > str.length) k = str.length;
      while (changed < k) {
        position = Math.floor(Math.random() * str.length);
        if (!this.errorsPositions[position]) {
          dataWithErrors[position] = str[position] === '1' ? '0' : '1';
          this.errorsPositions[position] = true;
          changed++;
        }
      }
    }
    return dataWithErrors.join('');
  }

  fixErrors = (str: string) => {
    this.fixedErrorsPositions = new Array(str.length).fill(false);
    let fixedData = str.split('');
    let d = 0, redundancy = 0, errors = 0;
    for (let i = 0; i < str.length; i++) {
      if (Math.pow(2, redundancy) - 1 != i)
        d++;
      else redundancy++;
    }
    // let dane = new Array(d);
    let mask = 0;
    d = 0;
    redundancy = 0;
    for (let i = 0; i < str.length; i++) {
      if (fixedData[i] === '1')
        mask ^= i + 1;
      if (Math.pow(2, redundancy) - 1 !== i)
        d++;
      else redundancy++;
    }

    if (mask !== 0) {
      errors++;
      if (mask - 1 < fixedData.length) {
        if (fixedData[mask - 1] === '1')
          fixedData[mask - 1] = '0';
        else fixedData[mask - 1] = '1';
        this.fixedErrorsPositions[mask - 1] = true;
      }
    }
    return fixedData.join('');
  }


}
