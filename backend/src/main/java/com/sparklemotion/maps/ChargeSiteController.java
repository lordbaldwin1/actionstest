package com.sparklemotion.maps;

import com.sparklemotion.maps.model.ChargeSite;
import com.sparklemotion.maps.model.ObfuscatedChargeSite;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chargesites")
@CrossOrigin(origins = {"https://localhost:8081"}) // Expo server IP address
public class ChargeSiteController {

  @Autowired private ChargeSiteService chargeSiteService;

  @GetMapping
  public List<ObfuscatedChargeSite> getAllChargeSites() {
    return ChargeSite.obfuscateAll(chargeSiteService.getAllChargeSites());
  }

  @GetMapping("/{id}")
  public ObfuscatedChargeSite getChargeSiteById(@PathVariable Long id) {
    return ChargeSite.obfuscate(chargeSiteService.getChargeSiteById(id));
  }

  @PostMapping
  public ResponseEntity<ObfuscatedChargeSite> createChargeSite(@RequestBody ChargeSite chargeSite) {
    chargeSite.generateObfuscation();
    ObfuscatedChargeSite obfuscatedChargeSite =
        ChargeSite.obfuscate(chargeSiteService.saveChargeSite(chargeSite));
    return new ResponseEntity<>(obfuscatedChargeSite, HttpStatus.CREATED);
  }

  @PutMapping("/{id}")
  public ObfuscatedChargeSite updateChargeSite(
      @PathVariable Long id, @RequestBody ChargeSite chargeSite) {
    chargeSite.setId(id);
    chargeSite.generateObfuscation();
    return ChargeSite.obfuscate(chargeSiteService.saveChargeSite(chargeSite));
  }

  @DeleteMapping("/{id}")
  public void deleteChargeSite(@PathVariable Long id) {
    chargeSiteService.deleteChargeSite(id);
  }
}
