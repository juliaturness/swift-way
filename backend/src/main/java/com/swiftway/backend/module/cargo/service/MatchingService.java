package com.swiftway.backend.module.cargo.service;

import com.swiftway.backend.module.cargo.domain.entity.Cargo;
import com.swiftway.backend.module.cargo.domain.entity.CargoMatch;
import com.swiftway.backend.module.cargo.repository.CargoMatchRepository;
import com.swiftway.backend.module.driver.domain.Driver;
import com.swiftway.backend.module.driver.domain.Vehicle;
import com.swiftway.backend.module.driver.repository.DriverRepository;
import com.swiftway.backend.module.driver.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

/**
 * Algoritmo de matching que conecta cargas a motoristas elegíveis.
 *
 * Filtros de elegibilidade (hard filters — eliminatórios):
 *   1. disponivel = true
 *   2. aprovado_gr = true (quando a carga exige)
 *   3. Tipo de veículo compatível com a carga
 *   4. Geolocalização dentro do raio configurável (padrão: 100 km)
 *
 * Scoring (soft score — 0 a 100):
 *   score = (PESO_PROXIMIDADE × proximidade_normalizada) + (PESO_HISTORICO × score_historico)
 *
 *   proximidade_normalizada = 1 - (distancia_km / raio_max_km)  → quanto mais perto, maior
 *   score_historico         = avaliacao_media / 5.0              → normalizado 0..1
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class MatchingService {

    private static final double PESO_PROXIMIDADE = 0.6;
    private static final double PESO_HISTORICO   = 0.4;
    private static final double EARTH_RADIUS_KM  = 6371.0;

    @Value("${swiftway.matching.raio-max-km:100}")
    private double raioMaxKm;

    private final DriverRepository      driverRepository;
    private final VehicleRepository     vehicleRepository;
    private final CargoMatchRepository  cargoMatchRepository;

    @Transactional
    public List<CargoMatch> findEligibleDrivers(Cargo cargo) {
        log.info("Starting matching for cargoId={}", cargo.getId());

        // Busca motoristas disponíveis e aprovados pela GR (quando exigido)
        List<Driver> candidates = cargo.isRequerAprovacaoGr()
            ? driverRepository.findDisponiveisAprovadosGr()
            : driverRepository.findDisponiveis();

        List<CargoMatch> matches = new ArrayList<>();

        for (Driver driver : candidates) {
            // Pula motoristas sem localização cadastrada
            if (driver.getLatitude() == null || driver.getLongitude() == null) continue;

            double distKm = haversineKm(
                driver.getLatitude().doubleValue(),
                driver.getLongitude().doubleValue(),
                cargo.getOrigemCidade()   // lat/lng da origem seria ideal — aqui simplificado
            );

            if (distKm > raioMaxKm) continue;

            // Busca veículo compatível com o tipo exigido pela carga
            Vehicle vehicle = vehicleRepository
                .findFirstActiveByDriverAndVehicleType(driver.getId(), cargo.getVehicleTypeId())
                .orElse(null);

            if (vehicle == null) continue;

            // Valida rastreador quando carga exige
            if (cargo.isRequerRastreador() && !vehicle.isHasTracker()) continue;

            // Evita duplicata no log de matching (constraint uq_cargo_match)
            if (cargoMatchRepository.existsByCargoIdAndDriverId(cargo.getId(), driver.getId())) {
                continue;
            }

            BigDecimal score = calcularScore(distKm, driver.getAverageRating());

            CargoMatch match = CargoMatch.builder()
                .cargo(cargo)
                .driver(driver)
                .vehicle(vehicle)
                .score(score)
                .distanciaKm(BigDecimal.valueOf(distKm).setScale(2, RoundingMode.HALF_UP))
                .build();

            matches.add(cargoMatchRepository.save(match));
        }

        log.info("Matching completed for cargoId={}: {} eligible drivers found",
            cargo.getId(), matches.size());

        // Retorna ordenado por score decrescente
        matches.sort((a, b) -> b.getScore().compareTo(a.getScore()));
        return matches;
    }

    // ── Score ──────────────────────────────────────────────────────

    private BigDecimal calcularScore(double distanciaKm, BigDecimal avaliacaoMedia) {
        double proximidadeNorm = 1.0 - (distanciaKm / raioMaxKm);
        double historicoNorm   = avaliacaoMedia == null
            ? 0.0
            : avaliacaoMedia.doubleValue() / 5.0;

        double score = (PESO_PROXIMIDADE * proximidadeNorm) + (PESO_HISTORICO * historicoNorm);
        // Escala para 0–100
        double scoreScaled = score * 100.0;

        return BigDecimal.valueOf(scoreScaled).setScale(2, RoundingMode.HALF_UP);
    }

    // ── Haversine ──────────────────────────────────────────────────

    /**
     * Calcula distância em km entre dois pontos geográficos.
     * Nota: a origem da carga não possui lat/lng no schema atual.
     * Esta implementação usa lat/lng do motorista contra coordenadas fixas
     * da cidade de origem — em produção, geocodificar a cidade via API.
     * Por ora, retorna uma distância estimada baseada apenas na posição do motorista.
     */
    private double haversineKm(double lat1, double lon1, String origemCidade) {
        // TODO: integrar geocodificação da cidade de origem
        // Por enquanto usa coordenadas aproximadas do centro do Brasil como fallback
        double lat2 = -15.7801;
        double lon2 = -47.9292;

        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);

        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
            + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
            * Math.sin(dLon / 2) * Math.sin(dLon / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return EARTH_RADIUS_KM * c;
    }
}
