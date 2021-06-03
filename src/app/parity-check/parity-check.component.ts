import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-parity-check',
  templateUrl: './parity-check.component.html',
  styleUrls: ['../app.component.css']
})
export class ParityCheckComponent implements OnInit {

  private pModel = new ParityModel();
  private inputArr: number[];
  input: string;
  outputBin: string;
  outputStr: string;
  encoded: string;
  errorStr : string;
  errorTypes: number[];
  fixedStr: string;
  fixedTypes: number[];
  constructor() {
    this.input = "";
    this.inputArr = [];
    this.outputBin = "";
    this.outputStr = "";
    this.encoded = "";
    this.errorStr = "";
    this.errorTypes = [];
    this.fixedStr = "";
    this.fixedTypes = [];
  }
  dec2bin = (dec: number) => (dec >>> 0).toString(2);

  strToByteArrayString = (str: string) => {
    let charVal;
    const bytes = [];
    for (let i = 0; i < str.length; i++) {
      charVal = str.charCodeAt(i);
      if (charVal < 256) {
        bytes[i] = this.dec2bin(str.charCodeAt(i));
        while (bytes[i].length<8){
          bytes[i] = '0' + bytes[i];
        }
      }
    }
    return bytes.join('');
  }

  strToNumArray = (str: string) => {
    let len = str.length;
    let arr = new Array(len);
    for (let i = 0; i < len; i++) {
      arr[i] = parseInt(str[i]);
    }
    return arr;
  }

  numArrayToStr = (arr: number[]) => {
    let string = "";
    let len = arr.length;
    for (let i = 0; i < len; i++) {
      if(typeof(arr[i]) !== 'undefined' && arr[i] !== null) {
        string = string.concat(arr[i].toString())
      }
    }
    return string;
  }

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

  setInput = (str: string) => {
    this.input = this.strToByteArrayString(str);
    this.inputArr = this.strToNumArray(this.input);
    // this.encodeParityCode();
    // this.errorStr = "";
    // this.fixedStr = "";
    // this.decodeParityCode();
    this.decodeErrors('0');
  }

  encodeParityCode = () => {
    let encodedData = '';
    if (this.inputArr.length) {
      this.pModel.encode(this.inputArr);
      encodedData = this.numArrayToStr(this.pModel.getCode());
    }
    this.encoded = encodedData;
  }

  decodeParityCode = () => {
    if (this.inputArr.length) {
      this.pModel.decode();
      this.outputBin = this.numArrayToStr(this.pModel.getDecoded());
      this.outputStr = this.ByteArrayStringToString(this.outputBin);
    }
  }

  setErrors = (n: string) => {
    if (n) {
      let k = parseInt(n);
      // n -> liczba bitow do przeklamania
      this.pModel.setRandErrors(k);
      this.errorTypes = this.getErrorTypes();
    }
    this.errorStr = this.numArrayToStr(this.pModel.getCode());
  }

  setError = (n: number) => {
    this.pModel.setError(n);
    this.errorTypes = this.getErrorTypes();
    this.errorStr = this.numArrayToStr(this.pModel.getCode());
    this.fixErrors();
    this.decodeParityCode();
  }

  fixErrors = () => {
    this.pModel.fix();
    this.fixedTypes = this.getErrorTypes();
    this.fixedStr = this.numArrayToStr(this.pModel.getCode());
  }

  decodeErrors = (str: string) => {
    this.encodeParityCode();
    this.setErrors(str);
    this.fixErrors();
    this.decodeParityCode();
  }

  getErrorTypes = () => {
    return this.pModel.getTypes();
  }

  ngOnInit() : void {
  }

}

class ParityModel {
  private type: number[]; //tablica z typami odpowiadajacymi danemu znakowi
                          //typy to np.poprawnyu bit, przeklamany bit etc.
  // private data: number[]; //wiadomosc niezakodowana (łańcuch znaków)
  private code: number[]; //tablica liczb odpowoadajaca zakodowanej wiadomosci
  private decoded: number[]; //tablica liczb wiadomosci odkodowanej
  private errors: number; // ilosc bledow przy dekodowaniu

  constructor() {
    this.code = [];
    this.type = [];
    this.decoded = [];
    this.errors = 0;
    // this.data = [];
  }

  getCode() {
    return this.code;
  }

  getDecoded() {
    return this.decoded;
  }

  getTypes() {
    return this.type;
  }

  // kodowanie danych przy użyciu kontroli parzystości
  encode(arr: number[]) {
    // len -> liczba bitow w danych
    let len = arr.length;
    // liczba bajtów w słowie
    let bytesNum = len / 8;
    len += 1;
    //this.lenght = arr.length;
    this.code = new Array(len);
    this.type = new Array(len);
    this.resetTypes();
    //liczba jedynek w danych
    let ones = 0;

    for (let i = 0; i < bytesNum; i++) {
      ones = 0;
      for (let j = 0; j < 8; j++) {
        this.code[i * 9 + j + 1] = arr[i * 8 + j];
        ones += arr[i * 8 + j];
      }
      // zapisuję bit parzystości
      this.code[i*9] = ones % 2 === 1 ? 1 : 0;
    }
  }

  decode() {
    let len = this.code.length;
    let bytesNum = len / 9;
    this.decoded = new Array(bytesNum * 8);
    // this.data = new Array(bytesNum * 8);
    let ones = 0;
    this.errors = 0;
    for(let i = 0; i < bytesNum; i++) {
      ones = 0;
      for (let j = 0; j < 8; j++) {
        // this.data[i * 8 + j] = this.code[i * 9 + j + 1];
        this.decoded[i * 8 + j] = this.code[i * 9 + j + 1];
        ones += this.code[i * 9 + j + 1];
      }
      ones += this.code[i * 9];
      // jezeli nie wykryto bledow
      if (ones % 2 === 0) {
        // oznaczam poprawny bit kontrolny
        this.type[i * 9] = 3;
        // oznaczam poprawne bity danych
        for (let j = 1; j < 9; j++) {
          this.type[i * 9 + j] = 0;
        }
      } else {
        //jezeli wystapily bledy
        this.errors++;
        // oznaczam bit kontrolny jako niewlasciwy
        this.type[i * 9] = 5;
        // oznaczam dane jako niewlasciwe
        for (let j = 1; j < 9; j++) {
          this.type[i * 9 + j] = 2;
        }
      }
    }
  }

  fix() {
    let len = this.code.length;
    // wyzerowanie typow bitow
    this.resetTypes();
    let bytesNum = len / 9;
    this.errors = 0;
    let ones = 0;
    for (let i = 0; i < bytesNum; i++) {
      ones = 0;
      // obliczam ilosc jedynek w bajcie
      for (let j = 0; j < 8; j++) {
        ones += this.code[i * 9 + j + 1];
      }
      ones += this.code[i*9];
      // jezeli nie wykryto bledow
      if (ones % 2 === 0) {
        // oznaczam poprawny bit kontrolny
        this.type[i*9] = 3;
        // oznaczam poprawne bity danych
        for (let j = 1; j < 9; j++) {
          this.type[i * 9 + j] = 0;
        }
      } else {
        //jezeli wystapily bledy
        this.errors++;
        // oznaczam bit kontrolny jako niewlasciwy
        this.type[i * 9] = 5;
        // onzaczam dane jako niewlasciwe
        for (let j = 1; j < 9; j++) {
          this.type[i * 9 + j] = 2;
        }
      }
    }
  }

  setRandErrors(n: number) {
    let len = this.code.length;
    // position -> pozycja bitu do zmiany
    // changedBits -> liczba zmienionych bitow
    let position = 0, changedBits = 0;
    // sprawdzenie czy nie podano wiekszej liczby bitow do
    // przeklamania niz dlugosc kodu
    if (n > len) n = len;
    // wprowadzajac bledy musze wyzerowac typy
    this.resetTypes();
    // ustawiam n losowych bitow na znaki przeciwne
    while (changedBits < n) {
      position = Math.floor(Math.random() * len);
      // sprawdzam czy wybrany bit nie zostal juz przeklamany
      if (!this.type[position]) {
        this.code[position] = this.code[position] === 1 ? 0 : 1;
        this.type[position] = 1;
        changedBits++;
      }
    }
  }

  resetTypes() {
    for(let i = 0; i < this.type.length; i++) {
      this.type[i] = 0;
    }
  }

  // ustawienie bledu na konkretnym bicie
  setError(n: number) {
    this.code[n] = this.code[n] === 1 ? 0 : 1;
    this.type[n] = this.type[n] === 1 ? 0 : 1;
  }
}

