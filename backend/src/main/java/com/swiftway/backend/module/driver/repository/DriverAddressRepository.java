package com.swiftway.backend.module.driver.repository;

import com.swiftway.backend.module.driver.domain.Address;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface DriverAddressRepository extends JpaRepository<Address, UUID> {
    Optional<Address> findByDriverId(UUID driverId);
}