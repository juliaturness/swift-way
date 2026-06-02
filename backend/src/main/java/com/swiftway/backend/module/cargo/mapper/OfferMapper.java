package com.swiftway.backend.module.cargo.mapper;

import com.swiftway.backend.module.cargo.domain.entity.Offer;
import com.swiftway.backend.module.cargo.dto.OfferDtos.OfferResponse;
import org.springframework.stereotype.Component;

@Component
public class OfferMapper {

    public OfferResponse toResponse(Offer o) {
        return new OfferResponse(
            o.getId(),
            o.getCargo().getId(),
            o.getCargo().getOrigemCidade(),
            o.getCargo().getOrigemEstado(),
            o.getCargo().getDestinoCidade(),
            o.getCargo().getDestinoEstado(),
            o.getStatus(),
            o.getCargoMatch().getScore(),
            o.getCargoMatch().getDistanciaKm(),
            o.getExpiraEm(),
            o.getRespondidaEm(),
            o.getCreatedAt()
        );
    }
}


