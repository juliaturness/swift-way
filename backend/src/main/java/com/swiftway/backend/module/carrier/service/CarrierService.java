package com.swiftway.backend.module.carrier.service;

import com.swiftway.backend.module.carrier.domain.Address;
import com.swiftway.backend.module.carrier.domain.Carrier;
import com.swiftway.backend.module.carrier.dto.CarrierDtos.*;
import com.swiftway.backend.module.carrier.mapper.CarrierMapper;
import com.swiftway.backend.module.carrier.repository.AddressRepository;
import com.swiftway.backend.module.carrier.repository.CarrierRepository;
import com.swiftway.backend.shared.exception.BusinessConflictException;
import com.swiftway.backend.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class CarrierService {

    private final CarrierRepository carrierRepository;
    private final AddressRepository addressRepository;
    private final CarrierMapper mapper;

    // ── Perfil ─────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public CarrierResponse getMyProfile(String email) {
        return mapper.toResponse(findByEmail(email));
    }

    @Transactional
    public CarrierResponse updateMyProfile(String email, UpdateCarrierRequest req) {
        Carrier carrier = findByEmail(email);
        String sanitizedCnpj = sanitizeCnpj(req.cnpj());

        if (carrierRepository.existsByCnpjAndIdNot(sanitizedCnpj, carrier.getId())) {
            throw new BusinessConflictException("CNPJ já utilizado por outra transportadora.");
        }

        carrier.setCnpj(sanitizedCnpj);
        carrier.setRazaoSocial(req.razaoSocial());
        carrier.setNomeFantasia(req.nomeFantasia());
        carrier.setTelefone(req.telefone());

        Carrier saved = carrierRepository.save(carrier);
        log.info("Carrier profile updated: carrierId={}", saved.getId());
        return mapper.toResponse(saved);
    }

    @Transactional(readOnly = true)
    public CarrierPublicResponse getPublicProfile(UUID id) {
        Carrier carrier = carrierRepository.findActiveById(id)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Transportadora não encontrada: id=" + id));
        return mapper.toPublicResponse(carrier);
    }

    // ── Endereços ──────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<AddressResponse> listAddresses(String email) {
        Carrier carrier = findByEmail(email);
        return addressRepository.findByCarrierId(carrier.getId())
            .stream()
            .map(mapper::toAddressResponse)
            .toList();
    }

    @Transactional
    public AddressResponse addAddress(String email, CreateAddressRequest req) {
        Carrier carrier = findByEmail(email);

        // Garante unicidade de SEDE: cada carrier pode ter no máximo 1
        if (req.type() == com.swiftway.backend.module.carrier.domain.AddressType.SEDE
            && addressRepository.existsByCarrierIdAndType(
            carrier.getId(),
            com.swiftway.backend.module.carrier.domain.AddressType.SEDE)) {
            throw new BusinessConflictException(
                "A transportadora já possui um endereço do tipo SEDE. Remova-o antes de adicionar outro.");
        }

        Address address = Address.builder()
            .carrier(carrier)
            .type(req.type())
            .logradouro(req.logradouro())
            .numero(req.numero())
            .complemento(req.complemento())
            .bairro(req.bairro())
            .cidade(req.cidade())
            .estado(req.estado().toUpperCase())
            .cep(req.cep())
            .build();

        Address saved = addressRepository.save(address);
        log.info("Address added: addressId={} type={} for carrierId={}", saved.getId(), saved.getType(), carrier.getId());
        return mapper.toAddressResponse(saved);
    }

    @Transactional
    public AddressResponse updateAddress(String email, UUID addressId, UpdateAddressRequest req) {
        Carrier carrier = findByEmail(email);

        Address address = addressRepository.findByIdAndCarrierId(addressId, carrier.getId())
            .orElseThrow(() -> new ResourceNotFoundException(
                "Endereço não encontrado: id=" + addressId));

        address.setLogradouro(req.logradouro());
        address.setNumero(req.numero());
        address.setComplemento(req.complemento());
        address.setBairro(req.bairro());
        address.setCidade(req.cidade());
        address.setEstado(req.estado().toUpperCase());
        address.setCep(req.cep());

        Address saved = addressRepository.save(address);
        log.info("Address updated: addressId={} for carrierId={}", addressId, carrier.getId());
        return mapper.toAddressResponse(saved);
    }

    @Transactional
    public void removeAddress(String email, UUID addressId) {
        Carrier carrier = findByEmail(email);

        Address address = addressRepository.findByIdAndCarrierId(addressId, carrier.getId())
            .orElseThrow(() -> new ResourceNotFoundException(
                "Endereço não encontrado: id=" + addressId));

        addressRepository.delete(address);
        log.info("Address removed: addressId={} for carrierId={}", addressId, carrier.getId());
    }

    // ── helpers ───────────────────────────────────────────────────

    private Carrier findByEmail(String email) {
        return carrierRepository.findByUserEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Perfil de transportadora não encontrado para: " + email));
    }

    private String sanitizeCnpj(String cnpj) {
        return cnpj == null ? null : cnpj.replaceAll("[.\\-/]", "");
    }
}
