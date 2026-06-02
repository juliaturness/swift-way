package com.swiftway.backend.module.cargo.repository;

import com.swiftway.backend.module.cargo.domain.entity.Offer;
import com.swiftway.backend.module.cargo.domain.enums.OfferStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface OfferRepository extends JpaRepository<Offer, UUID> {

    /**
     * Pending offers feed for a driver — matches idx_offers_driver_pendentes.
     */
    @Query("""
        SELECT o FROM Offer o
        JOIN FETCH o.cargo c
        JOIN FETCH o.driver d
        WHERE d.user.email = :email
          AND o.status = 'ENVIADA'
        ORDER BY o.createdAt DESC
        """)
    Page<Offer> findPendingByDriverEmail(@Param("email") String email, Pageable pageable);

    /**
     * Cancel all open offers for a cargo except the one just accepted.
     */
    @Modifying
    @Query(value = """
    UPDATE offers
    SET status = 'CANCELADA'::offer_status,
        updated_at = NOW()
    WHERE cargo_id = :cargoId
      AND status = 'ENVIADA'::offer_status
      AND id <> :excludedOfferId
    """, nativeQuery = true)
    int cancelOtherOffers(@Param("cargoId") UUID cargoId,
                          @Param("excludedOfferId") UUID excludedOfferId);
    Optional<Offer> findByIdAndDriverUserEmail(UUID id, String email);

    boolean existsByCargoIdAndDriverId(UUID cargoId, UUID driverId);
}
