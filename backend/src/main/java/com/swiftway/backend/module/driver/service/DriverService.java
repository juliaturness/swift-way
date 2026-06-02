package com.swiftway.backend.module.driver.service;

import com.swiftway.backend.module.driver.domain.Driver;
import com.swiftway.backend.module.driver.domain.Vehicle;
import com.swiftway.backend.module.driver.dto.DriverDtos.*;
import com.swiftway.backend.module.driver.mapper.DriverMapper;
import com.swiftway.backend.module.driver.repository.DriverRepository;
import com.swiftway.backend.module.driver.repository.VehicleRepository;
import com.swiftway.backend.shared.exception.BusinessConflictException;
import com.swiftway.backend.shared.exception.ForbiddenException;
import com.swiftway.backend.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static com.swiftway.backend.shared.utils.CpfUtils.sanitize;

@Slf4j
@Service
@RequiredArgsConstructor
public class DriverService {

    private final DriverRepository driverRepository;
    private final VehicleRepository vehicleRepository;
    private final DriverMapper mapper;

    @Transactional(readOnly = true)
    public DriverResponse getMyProfile(String email) {
        return mapper.toResponse(findByEmail(email));
    }

    @Transactional
    public DriverResponse updateMyProfile(String email, UpdateDriverRequest req) {
        Driver driver = findByEmail(email);

        if (driverRepository.existsByCpfAndIdNot(sanitize(req.cpf()), driver.getId())) {
            throw new BusinessConflictException("CPF já utilizado por outro motorista.");
        }
        if (req.cnhValidity() != null) {
            driver.setCnhValidity(req.cnhValidity());
        }

        driver.setFullName(req.fullName());
        driver.setCpf(sanitize(req.cpf()));
        driver.setPhone(req.phone());
        driver.setCnhNumber(req.cnhNumber());
        driver.setCnhCategory(req.cnhCategory());

        Driver saved = driverRepository.save(driver);
        log.info("Driver profile updated: driverId={}", saved.getId());
        return mapper.toResponse(saved);
    }

    @Transactional(readOnly = true)
    public PageResponse<DriverSummaryResponse> listDrivers(Pageable pageable) {
        Page<Driver> page = driverRepository.findAllWithUser(pageable);
        List<DriverSummaryResponse> content = page.getContent()
            .stream()
            .map(mapper::toSummary)
            .toList();

        return new PageResponse<>(
            content,
            page.getNumber(),
            page.getSize(),
            page.getTotalElements(),
            page.getTotalPages(),
            page.isLast()
        );
    }

    @Transactional
    public AvailabilityResponse updateAvailability(UUID driverId,
                                                   UpdateAvailabilityRequest req,
                                                   String requesterEmail) {
        Driver driver = findById(driverId);
        assertOwnerOrAdmin(driver, requesterEmail);

        driver.setAvailable(req.available());
        driverRepository.save(driver);
        log.info("Driver availability updated: driverId={}, available={}", driverId, req.available());

        return new AvailabilityResponse(driverId, driver.isAvailable());
    }

    @Transactional
    public LocationResponse updateLocation(UUID driverId,
                                           UpdateLocationRequest req,
                                           String requesterEmail) {
        Driver driver = findById(driverId);
        assertOwnerOrAdmin(driver, requesterEmail);

        driver.setLatitude(req.latitude());
        driver.setLongitude(req.longitude());
        driver.setLocationUpdatedAt(LocalDateTime.now());
        driverRepository.save(driver);
        log.debug("Driver location updated: driverId={}, lat={}, lng={}", driverId, req.latitude(), req.longitude());

        return new LocationResponse(driverId, driver.getLatitude(), driver.getLongitude());
    }

    @Transactional
    public VehicleResponse addVehicle(String email, CreateVehicleRequest req) {
        Driver driver = findByEmail(email);

        Vehicle vehicle = Vehicle.builder()
            .driver(driver)
            .vehicleTypeId(req.vehicleTypeId())
            .licensePlate(req.licensePlate().toUpperCase().replaceAll("-", ""))
            .make(req.make())
            .model(req.model())
            .manufactureYear(req.manufactureYear())
            .capacityTon(req.capacityTon())
            .hasTracker(req.hasTracker())
            .trackerCompany(req.trackerCompany())
            .active(true)
            .build();

        Vehicle saved = vehicleRepository.save(vehicle);
        log.info("Vehicle added: vehicleId={} for driverId={}", saved.getId(), driver.getId());
        return mapper.toVehicleResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<VehicleResponse> listMyVehicles(String email) {
        Driver driver = findByEmail(email);
        return vehicleRepository.findByDriverId(driver.getId())
            .stream()
            .map(mapper::toVehicleResponse)
            .toList();
    }

    @Transactional
    public void removeVehicle(String email, UUID vehicleId) {
        Driver driver = findByEmail(email);

        vehicleRepository.findByIdAndDriverId(vehicleId, driver.getId())
            .orElseThrow(() -> new ResourceNotFoundException(
                "Veículo não encontrado: id=" + vehicleId));

        vehicleRepository.deactivateVehicle(vehicleId, driver.getId());
        log.info("Vehicle soft-deleted: vehicleId={} for driverId={}", vehicleId, driver.getId());
    }

    private Driver findByEmail(String email) {
        return driverRepository.findByUserEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Perfil de motorista não encontrado para o usuário: " + email));
    }

    private Driver findById(UUID id) {
        return driverRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Motorista não encontrado: id=" + id));
    }

    private void assertOwnerOrAdmin(Driver driver, String requesterEmail) {
        boolean isOwner = driver.getUser().getEmail().equalsIgnoreCase(requesterEmail);
        boolean isAdmin = driver.getUser().getAuthorities().stream()
            .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        if (!isOwner && !isAdmin) {
            throw new ForbiddenException("Sem permissão para alterar dados deste motorista.");
        }
    }

}
