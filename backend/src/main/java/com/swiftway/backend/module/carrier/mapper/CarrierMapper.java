package com.swiftway.backend.module.carrier.mapper;

import com.swiftway.backend.module.carrier.domain.Address;
import com.swiftway.backend.module.carrier.domain.Carrier;
import com.swiftway.backend.module.carrier.dto.CarrierDtos.*;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class CarrierMapper {

    public CarrierResponse toResponse(Carrier c) {
        return new CarrierResponse(
            c.getId(),
            c.getUser().getId(),
            c.getUser().getEmail(),
            c.getCnpj(),
            c.getRazaoSocial(),
            c.getNomeFantasia(),
            c.getTelefone(),
            toAddressResponseList(c.getAddresses()),
            c.getCreatedAt(),
            c.getUpdatedAt()
        );
    }

    public CarrierPublicResponse toPublicResponse(Carrier c) {
        return new CarrierPublicResponse(
            c.getId(),
            c.getRazaoSocial(),
            c.getNomeFantasia(),
            c.getTelefone(),
            toAddressResponseList(c.getAddresses())
        );
    }

    public AddressResponse toAddressResponse(Address a) {
        return new AddressResponse(
            a.getId(),
            a.getType(),
            a.getLogradouro(),
            a.getNumero(),
            a.getComplemento(),
            a.getBairro(),
            a.getCidade(),
            a.getEstado(),
            a.getCep()
        );
    }

    private List<AddressResponse> toAddressResponseList(List<Address> addresses) {
        if (addresses == null) return List.of();
        return addresses.stream().map(this::toAddressResponse).toList();
    }
}
