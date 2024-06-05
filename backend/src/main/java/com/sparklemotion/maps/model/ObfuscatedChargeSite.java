package com.sparklemotion.maps.model;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ObfuscatedChargeSite {

  private Long id;
  private int userId;
  private double latitude; // This is obfuscated.
  private double longitude; // This is obfuscated.
  private boolean reservedStatus;
  private double rateOfCharge;

  /**
   * Copies the given obfuscated charge site's obfuscation to this obfuscated charge site.
   *
   * @apiNote Currently only used for testing.
   */
  public void copyObfuscation(ObfuscatedChargeSite other) {
    latitude = other.latitude;
    longitude = other.longitude;
  }
}
