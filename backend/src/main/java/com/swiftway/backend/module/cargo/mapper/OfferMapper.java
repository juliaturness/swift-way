package com.swiftway.backend.module.cargo.mapper;

import com.swiftway.backend.module.cargo.domain.entity.Offer;
import com.swiftway.backend.module.cargo.dto.OfferDtos.OfferResponse;
import org.springframework.stereotype.Component;
@Component
public class OfferMapper {

    public OfferResponse toResponse(Offer o) {
        var cargo   = o.getCargo();
        var carrier = cargo.getCarrier();
        var match   = o.getCargoMatch();

        return new OfferResponse(
            o.getId(),
            cargo.getId(),
            cargo.getOrigemCidade(),
            cargo.getOrigemEstado(),
            cargo.getDestinoCidade(),
            cargo.getDestinoEstado(),
            o.getStatus(),
            match != null ? match.getScore()       : null,
            match != null ? match.getDistanciaKm() : null,
            o.getExpiraEm(),
            o.getRespondidaEm(),
            o.getCreatedAt(),
            cargo.getTipo() != null ? cargo.getTipo().name() : null,
            cargo.getDescricao(),
            cargo.getPesoKg(),
            cargo.getValorCarga(),
            cargo.getDataColetaLimite(),
            cargo.getDataEntregaPrevista(),
            carrier != null ? carrier.getId()          : null,
            carrier != null ? carrier.getRazaoSocial() : null,
            carrier != null ? carrier.getNomeFantasia() : null,
            o.getFotoEntregaUrl()

        );
    }
}

