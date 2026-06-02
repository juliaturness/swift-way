package com.swiftway.backend.module.document.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

/**
 * Abstração de armazenamento de arquivos.
 *
 * Em dev: salva no filesystem local em ${swiftway.storage.local-path}.
 * Em produção: substituir o corpo de upload() pela chamada ao SDK do S3/MinIO
 * sem mudar nada nos callers (DocumentService permanece igual).
 *
 * Para integrar S3:
 *   1. Adicionar software.amazon.awssdk:s3 no build.gradle
 *   2. Substituir o bloco de Files.copy pelo S3Client.putObject()
 *   3. Ajustar a URL de retorno para o endpoint do bucket
 */
@Slf4j
@Service
public class StorageService {

    @Value("${swiftway.storage.local-path:uploads}")
    private String localPath;

    @Value("${swiftway.storage.base-url:http://localhost:8082/files}")
    private String baseUrl;

    /**
     * Faz upload do arquivo e retorna a URL pública de acesso.
     */
    public String upload(MultipartFile file, String folder) {
        try {
            String extension = getExtension(file.getOriginalFilename());
            String filename   = UUID.randomUUID() + extension;
            Path   dir        = Paths.get(localPath, folder);

            Files.createDirectories(dir);
            Files.copy(file.getInputStream(), dir.resolve(filename));

            String url = baseUrl + "/" + folder + "/" + filename;
            log.info("File uploaded: {}", url);
            return url;

        } catch (IOException e) {
            throw new RuntimeException("Falha ao armazenar arquivo: " + e.getMessage(), e);
        }
    }

    private String getExtension(String filename) {
        if (filename == null || !filename.contains(".")) return "";
        return filename.substring(filename.lastIndexOf('.'));
    }
}
