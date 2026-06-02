package com.swiftway.backend.module.carrier.repository;

import com.swiftway.backend.module.carrier.domain.Address;
import com.swiftway.backend.module.carrier.domain.AddressType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AddressRepository extends JpaRepository<Address, UUID> {

    List<Address> findByCarrierId(UUID carrierId);

    Optional<Address> findByIdAndCarrierId(UUID id, UUID carrierId);

    boolean existsByCarrierIdAndType(UUID carrierId, AddressType type);

    @Query("SELECT COUNT(a) FROM Address a WHERE a.carrier.id = :carrierId")
    long countByCarrierId(@Param("carrierId") UUID carrierId);
}
