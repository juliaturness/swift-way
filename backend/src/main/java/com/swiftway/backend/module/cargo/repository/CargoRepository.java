package com.swiftway.backend.module.cargo.repository;

import com.swiftway.backend.module.cargo.domain.entity.Cargo;
import com.swiftway.backend.module.cargo.domain.enums.CargoStatus;
import com.swiftway.backend.module.cargo.domain.enums.CargoTipo;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

public interface CargoRepository extends JpaRepository<Cargo, UUID>, JpaSpecificationExecutor<Cargo> {
    @Query("""
        SELECT c FROM Cargo c
        JOIN FETCH c.carrier
        WHERE c.id = :id AND c.deletedAt IS NULL
        """)
    Optional<Cargo> findActiveById(@Param("id") UUID id);

    @Query("""
        SELECT c FROM Cargo c
        JOIN FETCH c.carrier
        WHERE c.deletedAt IS NULL
          AND (:status    IS NULL OR c.status = :status)
          AND (:tipo      IS NULL OR c.tipo   = :tipo)
          AND (:origem    IS NULL OR LOWER(c.origemCidade) LIKE LOWER(CONCAT('%', :origem, '%')))
          AND (:dataInicio IS NULL OR c.dataColetaLimite >= :dataInicio)
          AND (:dataFim    IS NULL OR c.dataColetaLimite <= :dataFim)
        """)
    Page<Cargo> findAllWithFilters(
        @Param("status")     CargoStatus status,
        @Param("tipo")       CargoTipo tipo,
        @Param("origem")     String origem,
        @Param("dataInicio") LocalDateTime dataInicio,
        @Param("dataFim")    LocalDateTime dataFim,
        Pageable pageable
    );

    @Query("""
        SELECT c FROM Cargo c
        JOIN FETCH c.carrier
        WHERE c.carrier.id = :carrierId AND c.deletedAt IS NULL
        """)
    Page<Cargo> findByCarrierId(@Param("carrierId") UUID carrierId, Pageable pageable);
}
