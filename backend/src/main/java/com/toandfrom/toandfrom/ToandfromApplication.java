package com.toandfrom.toandfrom;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling  // Enable scheduled tasks (for CurrencyService cache cleanup)
public class ToandfromApplication {

	public static void main(String[] args) {
		SpringApplication.run(ToandfromApplication.class, args);
	}

}

