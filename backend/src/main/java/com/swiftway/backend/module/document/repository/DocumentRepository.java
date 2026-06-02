package com.swiftway.backend.module.document.repository;

import com.swiftway.backend.module.document.domain.Document;
import com.swiftway.backend.module.document.domain.DocumentStatus;
import com.swiftway.backend.module.document.domain.DocumentType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DocumentRepository extends JpaRepository<Document, UUID> {

    List<Document> findByDriverId(UUID driverId);

    Optional<Document> findByIdAndDriverId(UUID id, UUID driverId);

    // Usado na validação de elegibilidade do matching
    @Query("""
        SELECT d FROM Document d
        WHERE d.driver.id = :driverId
          AND d.status = 'APROVADO'
          AND (d.validade IS NULL OR d.validade >= CURRENT_DATE)
        """)
    List<Document> findAprovadosVigentes(@Param("driverId") UUID driverId);

    // Job de expiração: documentos aprovados com validade vencida
    @Query("""
        SELECT d FROM Document d
        WHERE d.status = 'APROVADO'
          AND d.validade IS NOT NULL
          AND d.validade < :hoje
        """)
    List<Document> findVencidos(@Param("hoje") LocalDate hoje);

    // Job de notificação: documentos aprovados vencendo nos próximos N dias
    @Query("""
        SELECT d FROM Document d
        WHERE d.status = 'APROVADO'
          AND d.validade IS NOT NULL
          AND d.validade >= :hoje
          AND d.validade <= :limite
        """)
    List<Document> findProximosDoVencimento(
        @Param("hoje")   LocalDate hoje,
        @Param("limite") LocalDate limite
    );

    // Verifica constraint de unicidade antes do insert (evitar 409 mais cedo)
    @Query("""
        SELECT COUNT(d) > 0 FROM Document d
        WHERE d.driver.id = :driverId
          AND d.type = :type
          AND d.status IN ('PENDENTE', 'APROVADO')
        """)
    boolean existsAtivoByDriverIdAndType(
        @Param("driverId") UUID driverId,
        @Param("type")     DocumentType type
    );

    // Atualização em massa usada pelo job
    @Modifying
    @Query("""
        UPDATE Document d SET d.status = 'EXPIRADO', d.updatedAt = CURRENT_TIMESTAMP
        WHERE d.status = 'APROVADO'
          AND d.validade IS NOT NULL
          AND d.validade < :hoje
        """)
    int expireVencidos(@Param("hoje") LocalDate hoje);
}
