package com.swiftway.backend.shared.exception;

import java.util.UUID;

public class CargoNotFoundException extends RuntimeException {

    public CargoNotFoundException(UUID id) {
        super("Carga não encontrada com id: " + id);
    }
}
