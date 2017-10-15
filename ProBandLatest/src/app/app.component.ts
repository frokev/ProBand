import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { DemoPage } from '../pages/demo/demo';
import { TabsPage } from '../pages/tabs/tabs';
import { BLE } from '@ionic-native/ble';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage:any = DemoPage;

  constructor(platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      splashScreen.hide();
    });
  }
}
