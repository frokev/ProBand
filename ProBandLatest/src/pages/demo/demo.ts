import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { BLE } from '@ionic-native/ble';
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

  private deviceId: string;
  private serviceUUID: string;
  private characteristicUUID: string;

  private isConnectedPromise: Promise<any>;
  private readItemPromise: Promise<any>;
  private writeIntervalPromise: Promise<any>;

  constructor(public navCtrl: NavController, private ble: BLE) {
    this.items = this.generateItems();

    this.date = new Date();
    this.dateStr = this.formatDate(this.date);

    this.isConnectedPromise = this.ble.isConnected(this.deviceId);

    this.readItemPromise = 
      this.isConnectedPromise.then(isConnected => {
          console.log("Is connected to: " + this.deviceId + " status: " + isConnected);
          return this.ble.read(this.deviceId, this.serviceUUID, this.characteristicUUID);
      }).catch(notConnected => {
        console.log("Is not connected to: " + this.deviceId + " status: " + notConnected);
        return Promise.reject("no connected is sad too bad");
      });

    this.readItemPromise.then( val => {
      var readVal = this.bytesToString(val);
      
      console.log("readItemPromise: " + val);

      this.items.push(
        new DemoPage.Item(
          new DemoPage.TimeStamp(this.date.getHours(), this.date.getMinutes()),
          this.intervalMin
        )
      );

    }).catch(err => {});
  }

  setInterval(intervalMin: number) {
    var val: ArrayBuffer = this.stringToBytes(intervalMin.toString());

    this.isConnectedPromise.then(isConnected => {
      this.writeIntervalPromise = this.ble.write(this.deviceId, this.serviceUUID, this.characteristicUUID, val);

    }).catch(e => {
      //inform user he's not connected.
    });

    this.writeIntervalPromise.then(p => {
      this.intervalMin = intervalMin;
    });
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
