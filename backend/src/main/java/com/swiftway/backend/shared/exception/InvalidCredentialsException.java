package com.swiftway.backend.shared.exception;

public class InvalidCredentialsException extends RuntimeException {
    public InvalidCredentialsException() {
        super("Credenciais inválidas.");
    }
    public InvalidCredentialsException(String msg) {
        super(msg);
    }
}
