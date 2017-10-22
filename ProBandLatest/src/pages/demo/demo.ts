import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial';
import { Observable, Subject } from 'rxjs';

@Component({
  selector: 'page-about',
  templateUrl: 'demo.html'
})

export class DemoPage {

  private itemsSubject: Subject<Item[]> = new Subject();
  private itemsObservable: Observable<Item[]> = this.itemsSubject;
  private items: Item[];

  public dateStr: string;

  private intervalMin: number;
  private date: Date;

  private deviceUUID = ("98:d3:31:fb:72:1f").toUpperCase();


  constructor(public navCtrl: NavController, private bls: BluetoothSerial)
  {

    this.intervalMin = 5;
    this.items = [];
    this.date = new Date();
    this.dateStr = DemoPage.formatDate(this.date);

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


    this.bls.subscribe("\n").subscribe(
      data => {
        console.log("Data read: " + data);
        this.onReadFromDevice(data);
      },
      err => { console.log("error reading data: " + err); }
    );

    this.itemsObservable.subscribe( val => {
      console.log(JSON.stringify(val));
    });
  }

  getItems(): Observable<Array<any>> {
    return this.itemsObservable.share();
  }

  onReadFromDevice(val){
    let readVal = this.bytesToString(val);

    this.date = new Date();

    this.items.push(
      new Item(

        new TimeStamp(
          this.date.getHours(),
          this.date.getMinutes()
        ),

        this.intervalMin
      )
    );

    this.itemsSubject.next(this.items);
  }

  setInterval(intervalMin: number) {
    let val: ArrayBuffer = this.stringToBytes(intervalMin.toString());
    console.log("Trying to write data...");
    this.bls.write(this.intervalMin + "\n").then(() => {
      console.log("Interval changed to " + intervalMin);

    }).catch(() => {
      console.log("Could not write interval to device");
    });
  }

  static formatDate(date: Date) {
    return date.getDate() + "-" + date.getMonth() + "-" + date.getFullYear();
  }

  //Generates a list of test Items
  generateItems() {
    let items = [];

    function getRandomItem(){
      return new Item(
        new TimeStamp(
          Math.floor(Math.random() * 24) + 1,
          Math.floor(Math.random() * 60) + 1
        ),

        Math.floor((Math.random() * 10) + 1) * 5
      );
    }

    for (let i = 0; i < 10; i++){
      items.push(getRandomItem());
    }

    return items;
  }

  dateLeftButton() {
    this.date.setDate(this.date.getDate()-1);
    this.dateStr = DemoPage.formatDate(this.date);
  }
  dateRightButton() {
    this.date.setDate(this.date.getDate()+1);
    this.dateStr = DemoPage.formatDate(this.date);
  }

  // ASCII only
  stringToBytes = function(string) {
    let array = new Uint8Array(string.length);
    for (let i = 0, l = string.length; i < l; i++) {
        array[i] = string.charCodeAt(i);
      }
      return array.buffer;
  }

  // ASCII only
  bytesToString(buffer) {
      return String.fromCharCode.apply(null, new Uint8Array(buffer));
  }

}

export class Item {
  public IntervalMin: number;
  public TimeStamp: TimeStamp;
  constructor(timeStamp, intervalMin: number){
    this.IntervalMin = intervalMin;
    this.TimeStamp = timeStamp;
  }
}

export class TimeStamp {
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
