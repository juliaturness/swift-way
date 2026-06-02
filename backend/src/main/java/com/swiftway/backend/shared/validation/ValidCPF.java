package com.swiftway.backend.shared.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

/**
 * Valida que o valor anotado é um CPF brasileiro válido.
 * Aceita apenas dígitos (11 chars) ou no formato {@code 000.000.000-00}.
 *
 * <pre>{@code
 * @ValidCPF
 * private String cpf;
 * }</pre>
 */
@Documented
@Constraint(validatedBy = CpfValidator.class)
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidCPF {

    String message() default "CPF inválido";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
