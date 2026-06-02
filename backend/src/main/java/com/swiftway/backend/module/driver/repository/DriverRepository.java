package com.swiftway.backend.module.driver.repository;

import com.swiftway.backend.module.driver.domain.Driver;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DriverRepository extends JpaRepository<Driver, UUID> {

    /** Busca pelo e-mail do usuário vinculado. */
    @Query("SELECT d FROM Driver d JOIN d.user u WHERE u.email = :email")
    Optional<Driver> findByUserEmail(String email);

    /** Verifica se já existe um driver com o CPF informado. */
    boolean existsByCpf(String cpf);

    /**
     * Verifica se existe outro driver com o mesmo CPF, ignorando o próprio.
     */
    boolean existsByCpfAndIdNot(String cpf, UUID id);

    /** Lista todos os motoristas com paginação (admin). */
    @Query("SELECT d FROM Driver d JOIN FETCH d.user u")
    Page<Driver> findAllWithUser(Pageable pageable);

    // Adicionar estas queries ao DriverRepository existente:

    @Query("""
    SELECT d FROM Driver d
    JOIN FETCH d.user
    WHERE d.available = true
      AND d.deletedAt IS NULL
      AND d.latitude IS NOT NULL
      AND d.longitude IS NOT NULL
    """)
    List<Driver> findDisponiveis();

    @Query("""
    SELECT d FROM Driver d
    JOIN FETCH d.user
    WHERE d.available  = true
      AND d.grApproved  = true
      AND d.deletedAt   IS NULL
      AND d.latitude    IS NOT NULL
      AND d.longitude   IS NOT NULL
    """)
    List<Driver> findDisponiveisAprovadosGr();
}
