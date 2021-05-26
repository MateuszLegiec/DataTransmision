import { Component, OnInit } from '@angular/core';
import {parse} from "@angular/compiler/src/render3/view/style_parser";

@Component({
  selector: 'app-hamming',
  templateUrl: './hamming.component.html',
  styleUrls: ['./hamming.component.css']
})
export class HammingComponent implements OnInit {
  selected = true;

  constructor() { }

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
        while (bytes[i].length<8) {
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
      console.log(temp);
      if ((i+1) % 8 === 0) {
        console.log(String.fromCharCode(parseInt(temp, 2)));
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
      if(Math.pow(2, redundancy) -1 === sum)
        redundancy++;
      else {
        codedData[sum] = str[i];
        if(str[i] === '1')
          mask ^= sum+1;
        i++;
      }
      sum++;
    }
    redundancy = 0;
    for (let i = 0; i < sum; i++) {
      if (Math.pow(2, redundancy) - 1 === i) {
        if ((mask & (1 << redundancy)) === 0)
          codedData[i]='0';
        else
          codedData[i]='1';
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
      if (Math.pow(2, redundancy) -1 !== i ) {
        decodedData[sum] = str[i];
        sum++;
      }
      else redundancy++;
    }
    return decodedData.join('');
  }

}
