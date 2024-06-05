package com.sparklemotion.maps;

import com.sparklemotion.maps.model.ChargeSite;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ChargeSiteService {

  @Autowired private ChargeSiteRepository chargeSiteRepository;

  public List<ChargeSite> getAllChargeSites() {
    return chargeSiteRepository.findAll();
  }

  public ChargeSite getChargeSiteById(Long id) {
    return chargeSiteRepository.findById(id).orElse(null);
  }

  public ChargeSite saveChargeSite(ChargeSite chargeSite) {
    return chargeSiteRepository.save(chargeSite);
  }

  public void deleteChargeSite(Long id) {
    chargeSiteRepository.deleteById(id);
  }
}
