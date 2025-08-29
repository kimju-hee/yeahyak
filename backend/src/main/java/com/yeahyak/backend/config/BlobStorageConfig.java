package com.yeahyak.backend.config;

import com.azure.storage.blob.BlobContainerClient;
import com.azure.storage.blob.BlobServiceClient;
import com.azure.storage.blob.BlobServiceClientBuilder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class BlobStorageConfig {

  @Value("${azure.storage.blob-endpoint}")
  private String blobEndpoint;
  @Value("${azure.storage.container-name}")
  private String containerName;
  @Value("${azure.storage.connection-string}")
  private String connectionString;

  @Bean
  public BlobServiceClient blobServiceClient() {
    return new BlobServiceClientBuilder()
        .connectionString(connectionString)
        .buildClient();
  }

  @Bean
  public BlobContainerClient blobContainerClient(BlobServiceClient blobServiceClient) {
    return blobServiceClient.getBlobContainerClient(containerName);
  }
}
