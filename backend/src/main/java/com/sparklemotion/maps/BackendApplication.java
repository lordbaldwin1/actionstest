package com.sparklemotion.maps;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;

// ANOTHER TEST
// COMMENT TEST HEHEHE

@SpringBootApplication
@ComponentScan(basePackages = "com.sparklemotion.*")
public class BackendApplication {
  public static void main(String[] args) {
    SpringApplication.run(BackendApplication.class, args);
  }
}
