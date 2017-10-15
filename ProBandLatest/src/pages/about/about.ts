import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

@Component({
  selector: 'page-about',
  templateUrl: 'about.html'
})
export class AboutPage {

  public items: Array<any>;
  public dateStr: string;

  private date: Date;

  constructor(public navCtrl: NavController) {
    this.items = this.generateItems();

    this.date = new Date();
    this.date.setUTCDate(2);
    this.dateStr = this.formatDate(this.date);
    
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

  generateItems() {
    let items = [];

    function getRandomItem(){
      let retVal = new AboutPage.Item(

        new AboutPage.TimeStamp(
          Math.floor(Math.random() * 24) + 1, 
          Math.floor(Math.random() * 60) + 1
        ),

        Math.floor(Math.random() * 10) + 1 * 5
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

}
