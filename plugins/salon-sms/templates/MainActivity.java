package com.melakusisay.salonmanager;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import com.melakusisay.salonsms.SalonSmsPlugin;

public class MainActivity extends BridgeActivity {
  @Override
  public void onCreate(Bundle savedInstanceState) {
    registerPlugin(SalonSmsPlugin.class);
    super.onCreate(savedInstanceState);
  }
}
