package com.swiftway.backend.module.driver.domain;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

/**
 * Endereço residencial/comercial do motorista.
 * Relação 1-1 com {@link Driver}, armazenado em tabela separada.
 */
@Entity(name = "DriverAddress")
@Table(name = "driver_addresses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Address {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "driver_id", nullable = false, unique = true)
    private Driver driver;

    @Column(name = "cep", length = 8)
    private String cep;

    @Column(name = "logradouro", length = 255)
    private String street;

    @Column(name = "numero", length = 20)
    private String number;

    @Column(name = "complemento", length = 100)
    private String complement;

    @Column(name = "bairro", length = 100)
    private String neighborhood;

    @Column(name = "cidade", length = 100)
    private String city;

    @Column(name = "estado", length = 2)
    private String state;

    @Column(name = "ibge", length = 7)
    private String ibge;
}