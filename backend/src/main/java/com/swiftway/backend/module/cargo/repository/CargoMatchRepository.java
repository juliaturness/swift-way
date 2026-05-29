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
    @Query("SELECT m FROM CargoMatch m WHERE m.cargo = :cargoId ORDER BY m.score DESC")
    Page<CargoMatch> findByCargoIdOrderByScoreDesc(@Param("cargoId") UUID cargoId, Pageable pageable);

    /** Todas as cargas em que um motorista foi avaliado. */
    List<CargoMatch> findByDriverId(UUID driverId);

    boolean existsByCargoIdAndDriverId(UUID cargoId, UUID driverId);
}
