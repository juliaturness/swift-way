package com.swiftway.backend.shared.utils;

public final class CpfUtils {
    private CpfUtils() {}

    public static String sanitize(String cpf) {
        return cpf == null ? null : cpf.replaceAll("[.\\-]", "");
    }
}
