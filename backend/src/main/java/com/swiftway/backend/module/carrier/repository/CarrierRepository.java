package com.swiftway.backend.module.carrier.repository;

import com.swiftway.backend.module.carrier.domain.Carrier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface CarrierRepository extends JpaRepository<Carrier, UUID> {

    @Query("SELECT c FROM Carrier c JOIN FETCH c.user WHERE c.user.email = :email AND c.deletedAt IS NULL")
    Optional<Carrier> findByUserEmail(@Param("email") String email);

    boolean existsByCnpjAndIdNot(String cnpj, UUID id);

    @Query("SELECT c FROM Carrier c JOIN FETCH c.user WHERE c.id = :id AND c.deletedAt IS NULL")
    Optional<Carrier> findActiveById(@Param("id") UUID id);
}
