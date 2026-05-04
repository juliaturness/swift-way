package com.vaptvupt.backend.config;

import org.flywaydb.core.Flyway;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.sql.DataSource;

@Configuration
public class FlywayConfig {

    @Bean
    public Flyway flyway(DataSource dataSource) {
        System.out.println("========== FORÇANDO O FLYWAY NA MARRA ==========");

        Flyway flyway = Flyway.configure()
            .dataSource(dataSource)
            .locations("classpath:db/migration")
            .baselineOnMigrate(true)
            .load();

        // Isso obriga o Flyway a rodar a migração neste exato milissegundo,
        // sem depender do humor do Spring Boot.
        flyway.migrate();

        System.out.println("========== FLYWAY EXECUTADO ==========");
        return flyway;
    }
}
