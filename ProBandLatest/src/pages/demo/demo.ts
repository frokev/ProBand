import { Component } from '@angular/core';
import { NavController, Platform, NavParams } from 'ionic-angular';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial';
import {Observable} from 'rxjs/Observable';

@Component({
  selector: 'page-about',
  templateUrl: 'demo.html'
})

export class DemoPage {

  public items: Array<any>;
  public dateStr: string;

  private intervalMin: number = 5;
  private date: Date;

  private deviceUUID = ("98:d3:31:fb:72:1f").toUpperCase();

  private isConnected: boolean;

  private readItemObservable: Observable<any>;

  constructor(public navCtrl: NavController, private platform: Platform, private bls: BluetoothSerial) 
  { 
    this.items = this.generateItems(); 
    
    this.date = new Date();
    this.dateStr = this.formatDate(this.date);

    this.bls.enable().then(
      enabled => {
        console.log("Bluetooth is enabled");
      },
      err => {
        console.log("Could not enable bluetooth");
      }
    );

    this.bls.list().then(
      devices => {
        console.log(JSON.stringify(devices));
      }
    );

    this.bls.connect(this.deviceUUID).subscribe(
      connected => {
        console.log("connected to device: " + connected);
      },
      disconnected => {
        console.log("Disconnected from device, " + disconnected);
      }
    );

    this.bls.subscribe("delemitter").subscribe(
      data => {
        if (data != null) {
          console.log("Data read: " + data);
          this.onReadFromDevice(data);
        }
      },
      err => { console.log("error reading data: " + err); }
    );

    

  }

  onReadFromDevice(val){
    var readVal = this.bytesToString(val);

    this.items.push(
      new DemoPage.Item(
        new DemoPage.TimeStamp(this.date.getHours(), this.date.getMinutes()),
        this.intervalMin 
      )
    );
  }

  setInterval(intervalMin: number) {
    var val: ArrayBuffer = this.stringToBytes(intervalMin.toString());

    this.bls.write(val);
  }

  

  public static Item = class {
    intervalMin;
    timeStamp;
    constructor(timeStamp, intervalMin: number){
      this.intervalMin = intervalMin;
      this.timeStamp = timeStamp;
    }
  }

  public static TimeStamp = class {
    public hours;
    public minutes;

    time: string;

    constructor(hours: number, minutes: number){
      

      let hStr = (hours < 10) ? '0' + hours : hours.toString();
      let mStr = (minutes < 10) ? '0' + minutes : minutes.toString();

      this.time = hStr + ':' + mStr;
    }

    public toString() {
      return this.time;
    }
    
  }

  formatDate(date: Date) {
    let dStr = date.getDate() + "-" + date.getMonth() + "-" + date.getFullYear();
    return dStr;
  } 

  //Generates a list of test Items
  generateItems() {
    let items = [];

    function getRandomItem(){
      let retVal = new DemoPage.Item(

        new DemoPage.TimeStamp(
          Math.floor(Math.random() * 24) + 1, 
          Math.floor(Math.random() * 60) + 1
        ),

        Math.floor((Math.random() * 10) + 1) * 5
      );
      return retVal;
    }

    for (let i = 0; i < 10; i++){
      items.push(getRandomItem());
    }

    return items;
  }

  dateLeftButton() {
    this.date.setDate(this.date.getDate()-1);
    this.dateStr = this.formatDate(this.date);
  }
  dateRightButton() {
    this.date.setDate(this.date.getDate()+1);
    this.dateStr = this.formatDate(this.date);
  }

  // ASCII only
  stringToBytes(string) {
    var array = new Uint8Array(string.length);
    for (var i = 0, l = string.length; i < l; i++) {
        array[i] = string.charCodeAt(i);
      }
      return array.buffer;
  }

  // ASCII only
  bytesToString(buffer) {
      return String.fromCharCode.apply(null, new Uint8Array(buffer));
  }

}
