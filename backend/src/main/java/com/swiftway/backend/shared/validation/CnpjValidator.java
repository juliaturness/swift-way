package com.swiftway.backend.shared.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

/**
 * Valida CNPJ pelo algoritmo oficial da Receita Federal.
 * Aceita entrada com ou sem formatação (pontos, barra, hífen).
 */
public class CnpjValidator implements ConstraintValidator<ValidCNPJ, String> {

    @Override
    public boolean isValid(String value, ConstraintValidatorContext ctx) {
        if (value == null || value.isBlank()) return false;

        String cnpj = value.replaceAll("[.\\-/]", "");

        if (cnpj.length() != 14 || cnpj.chars().distinct().count() == 1) return false;

        return digitMatches(cnpj, 12) && digitMatches(cnpj, 13);
    }

    private boolean digitMatches(String cnpj, int position) {
        int[] weights = (position == 12)
            ? new int[]{5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2}
            : new int[]{6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2};

        int sum = 0;
        for (int i = 0; i < position; i++) {
            sum += Character.getNumericValue(cnpj.charAt(i)) * weights[i];
        }

        int remainder = sum % 11;
        int expected = (remainder < 2) ? 0 : 11 - remainder;

        return Character.getNumericValue(cnpj.charAt(position)) == expected;
    }
}
