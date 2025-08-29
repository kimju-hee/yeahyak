package com.yeahyak.backend.service;

import com.azure.storage.blob.BlobClient;
import com.azure.storage.blob.BlobContainerClient;
import com.azure.storage.blob.models.BlobHttpHeaders;
import java.io.ByteArrayOutputStream;
import java.util.Optional;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class BlobStorageService {

  private final BlobContainerClient blobContainerClient;

  /**
   * 파일을 업로드합니다.
   */
  public UploadResult upload(MultipartFile file) {
    try {
      // 파일명 생성
      String original = Optional.ofNullable(file.getOriginalFilename()).orElse("file");
      String safeName = sanitize(original);
      String fileName = UUID.randomUUID() + "_" + safeName;

      // 블롭 클라이언트 생성
      BlobClient blobClient = blobContainerClient.getBlobClient(fileName);

      // 콘텐츠 타입 세팅
      BlobHttpHeaders headers = new BlobHttpHeaders().setContentType(file.getContentType());

      // 파일 업로드
      blobClient.upload(file.getInputStream(), file.getSize(), true);
      blobClient.setHttpHeaders(headers);

      return new UploadResult(fileName, file.getContentType(), file.getSize());
    } catch (Exception e) {
      throw new RuntimeException("파일 업로드에 실패했습니다.", e);
    }
  }

  /**
   * 파일을 다운로드합니다.
   */
  public DownloadPayload download(String fileName) {
    BlobClient blobClient = blobContainerClient.getBlobClient(fileName);
    if (!blobClient.exists()) {
      throw new RuntimeException("파일이 존재하지 않습니다.");
    }

    ByteArrayOutputStream out = new ByteArrayOutputStream();
    blobClient.downloadStream(out);
    byte[] bytes = out.toByteArray();

    String contentType = Optional.ofNullable(blobClient.getProperties().getContentType())
        .orElse("application/octet-stream");

    String downloadName = fileName.contains("_") ? fileName.split("_", 2)[1] : fileName;

    return new DownloadPayload(bytes, contentType, downloadName);
  }

  /**
   * 파일을 삭제합니다.
   */
  public void delete(String fileName) {
    blobContainerClient.getBlobClient(fileName).deleteIfExists();
  }

  /**
   * 파일명을 최소한으로 정제합니다.
   */
  private String sanitize(String original) {
    String sanitized = original.replaceAll("[\\r\\n\\t]+", "_")
        .replaceAll("[\\\\/]+", "_")
        .trim();
    return sanitized.isEmpty() ? "file" : sanitized;
  }

  /**
   * 업로드 결과 DTO.
   */
  @Getter
  @AllArgsConstructor
  public static class UploadResult {

    private final String blobName;
    private final String contentType;
    private final long size;
  }

  /**
   * 다운로드 페이로드 DTO.
   */
  @Getter
  @AllArgsConstructor
  public static class DownloadPayload {

    private final byte[] bytes;
    private final String contentType;
    private final String filename;
  }
}
