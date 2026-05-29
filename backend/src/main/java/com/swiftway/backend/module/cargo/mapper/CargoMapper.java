package com.swiftway.backend.module.cargo.mapper;

import com.swiftway.backend.module.cargo.domain.entity.Cargo;
import com.swiftway.backend.module.cargo.domain.entity.CargoMatch;
import com.swiftway.backend.module.cargo.dto.CargoDtos.*;
import org.springframework.stereotype.Component;

@Component
public class CargoMapper {

    public CargoResponse toResponse(Cargo c) {
        return new CargoResponse(
            c.getId(),
            c.getCarrier().getId(),
            c.getVehicleTypeId(),
            c.getOrigemCidade(),
            c.getOrigemEstado(),
            c.getOrigemEndereco(),
            c.getDestinoCidade(),
            c.getDestinoEstado(),
            c.getDestinoEndereco(),
            c.getTipo(),
            c.getDescricao(),
            c.getPesoKg(),
            c.getValorCarga(),
            c.getDataColetaLimite(),
            c.getDataEntregaPrevista(),
            c.isRequerEscolta(),
            c.isRequerRastreador(),
            c.isRequerIscaEletronica(),
            c.isRequerAprovacaoGr(),
            c.getStatus(),
            c.getObservacoes(),
            c.getCreatedAt(),
            c.getUpdatedAt()
        );
    }

    public CargoSummaryResponse toSummary(Cargo c) {
        return new CargoSummaryResponse(
            c.getId(),
            c.getCarrier().getId(),
            c.getOrigemCidade(),
            c.getOrigemEstado(),
            c.getDestinoCidade(),
            c.getDestinoEstado(),
            c.getTipo(),
            c.getPesoKg(),
            c.getStatus(),
            c.getDataColetaLimite(),
            c.getCreatedAt()
        );
    }

    public MatchedDriverResponse toMatchedDriver(CargoMatch cm) {
        return new MatchedDriverResponse(
            cm.getDriver().getId(),
            cm.getVehicle().getId(),
            cm.getDriver().getFullName(),
            cm.getScore(),
            cm.getDistanciaKm()
        );
    }
}
