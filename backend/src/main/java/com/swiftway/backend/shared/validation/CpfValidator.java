package com.swiftway.backend.shared.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

/**
 * Implementação do algoritmo de validação de CPF.
 * Remove pontos e traço antes de validar, portanto aceita tanto
 * {@code 12345678909} quanto {@code 123.456.789-09}.
 */
public class CpfValidator implements ConstraintValidator<ValidCPF, String> {

    @Override
    public boolean isValid(String value, ConstraintValidatorContext ctx) {
        if (value == null || value.isBlank()) {
            return true;
        }

        String digits = value.replaceAll("[.\\-]", "");

        if (!digits.matches("\\d{11}")) {
            return false;
        }

        // Rejeita sequências triviais (111.111.111-11, etc.)
        if (digits.chars().distinct().count() == 1) {
            return false;
        }

        return checkDigit(digits, 9) && checkDigit(digits, 10);
    }

    /**
     * Verifica o dígito verificador na posição {@code position} (base-0).
     */
    private boolean checkDigit(String digits, int position) {
        int sum = 0;
        int weight = position + 1; // 10 para o 1º dígito, 11 para o 2º

        for (int i = 0; i < position; i++) {
            sum += Character.getNumericValue(digits.charAt(i)) * (weight - i);
        }

        int remainder = (sum * 10) % 11;
        int expected = (remainder == 10 || remainder == 11) ? 0 : remainder;
        int actual = Character.getNumericValue(digits.charAt(position));

        return expected == actual;
    }
}
