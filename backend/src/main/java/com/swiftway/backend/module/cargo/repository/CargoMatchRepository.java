package com.swiftway.backend.module.cargo.repository;

import com.swiftway.backend.module.cargo.domain.entity.CargoMatch;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CargoMatchRepository extends JpaRepository<CargoMatch, UUID> {

    /** Motoristas elegíveis para uma carga, ordenados por score decrescente (como o índice). */
    @Query("SELECT m FROM CargoMatch m WHERE m.cargo.id = :cargoId ORDER BY m.score DESC")
    Page<CargoMatch> findByCargoIdOrderByScoreDesc(@Param("cargoId") UUID cargoId, Pageable pageable);

    /** Todas as cargas em que um motorista foi avaliado. */
    List<CargoMatch> findByDriverId(UUID driverId);

    boolean existsByCargoIdAndDriverId(UUID cargoId, UUID driverId);

    /** Used by OfferService when creating offers — returns matches ordered by score. */
    List<CargoMatch> findByCargoIdOrderByScoreDesc(UUID cargoId);

    /**
     * Returns true if at least one offer for this cargo is still in an open state
     * (ENVIADA or ACEITA). Used to decide whether to revert the cargo to AGUARDANDO.
     */
    @Query("""
        SELECT COUNT(o) > 0 FROM Offer o
        WHERE o.cargo.id = :cargoId
          AND o.status IN (
              com.swiftway.backend.module.cargo.domain.enums.OfferStatus.ENVIADA,
              com.swiftway.backend.module.cargo.domain.enums.OfferStatus.ACEITA
          )
        """)
    boolean existsOpenOfferForCargo(@Param("cargoId") UUID cargoId);
}
