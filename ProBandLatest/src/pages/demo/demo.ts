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

  private device;
  private devices: Array<any>;
  private isConnected: boolean;

  private readItemObservable: Observable<any>;

  constructor(public navCtrl: NavController, private ble: BLE) 
  {
    this.items = this.generateItems();
    
    this.date = new Date();
    this.dateStr = this.formatDate(this.date);

    //Scan for BLE devices
    this.ble.scan([], 5).subscribe(
      device => { 
          console.log("Device found, name: " + device.name + ", id: " + device.id);
          if (device.name == "HC-06") {
            this.connectToDevice(device);
          }
        },

      error => { 
        console.log ("error while searching for devices: " + error);
      }
    );
  }

  onConnected(device){
    this.isConnected = true;
    this.readItemObservable = Observable.create(observer => {
      console.log("Connected to: " + device.name + " device info: " + device);

      for (let i = 0; i < device.characteristics.length(); i++){

        if(device.characteristics[i].properties.indexOf("Read") > -1){

          console.log("trying to read from device with \n" + 
                      "serviceUUID: " + device.characteristics[i].service +
                      "\ncharacteristicUUID: " + device.characteristics[i].characteristic +
                      "\nproperties: " + device.characteristics[i].properties
                      );
          
          while(this.isConnected){
            setTimeout(function() {
              let val = this.ble.read(
                device.id, 
                device.characteristics[i].service, 
                device.characteristics[i].characteristic
              );

            observer.onNext(val);
            }.bind(this), 5000); 
          }
        }
      }
    });

    this.readItemObservable.subscribe(
      val => {
        this.onReadFromDevice(val);
      },
      
      err => {
        console.log(err);
      }
    );

  }

  onDisconnected(){
    this.isConnected = false;
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

  connectToDevice(device: any) {
    this.ble.connect(device.id).subscribe(
      _device => { 
        this.device = _device;
        this.onConnected(_device)
      },
      error => { 
        this.onDisconnected(); 
      }
    );
  }

  setInterval(intervalMin: number): Promise<any> {
    var val: ArrayBuffer = this.stringToBytes(intervalMin.toString());

    return new Promise(function(resolve, reject){
          let device = this.device;

          if (this.isConnected){          
            for (let i = 0; i < device.characteristics.length(); i++){

                if(device.characteristics[i].properties.indexOf("Write") > -1){

                  console.log("trying to write to device with \n" + 
                              "serviceUUID: " + device.characteristics[i].service +
                              "\ncharacteristicUUID: " + device.characteristics[i].characteristic +
                              "\nproperties: " + device.characteristics[i].properties
                              );

                  let resVal = this.ble.write(
                      device.id, 
                      device.characteristics[i].service, 
                      device.characteristics[i].characteristic,
                      val
                    );

                  resolve(resVal);
                }
            }

            setTimeout(function() {
            reject("setInterval function timed out," + 
                                          "couldn't find any writable characteristics.");
            }.bind(this), 5000);

          } 
          
          else {
            reject("Error in setInterval(): device not connected");
          }

    }.bind(this));
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
