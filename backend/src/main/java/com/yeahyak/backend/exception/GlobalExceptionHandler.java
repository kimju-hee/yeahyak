package com.yeahyak.backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.yeahyak.backend.dto.ApiResponse;

import lombok.extern.slf4j.Slf4j;

/**
 * 전역 예외 처리 핸들러
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

  /**
   * FlaskPredictException 처리 (AI 예측 서버 오류)
   */
  @ExceptionHandler(FlaskPredictException.class)
  public ResponseEntity<ApiResponse<String>> handleFlaskPredictException(FlaskPredictException e) {
    log.error("Flask 예측 서버 오류: ", e);
    return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
        .body(ApiResponse.error(e.getMessage()));
  }

  /**
   * RuntimeException 처리
   */
  @ExceptionHandler(RuntimeException.class)
  public ResponseEntity<ApiResponse<String>> handleRuntimeException(RuntimeException e) {
    log.error("RuntimeException 발생: ", e);
    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
        .body(ApiResponse.error(e.getMessage()));
  }

  /**
   * IllegalArgumentException 처리
   */
  @ExceptionHandler(IllegalArgumentException.class)
  public ResponseEntity<ApiResponse<String>> handleIllegalArgumentException(IllegalArgumentException e) {
    log.error("IllegalArgumentException 발생: ", e);
    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
        .body(ApiResponse.error(e.getMessage()));
  }

  /**
   * Validation 예외 처리 (@Valid 어노테이션)
   */
  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<ApiResponse<String>> handleValidationException(MethodArgumentNotValidException e) {
    log.error("Validation 예외 발생: ", e);
    
    String errorMessage = e.getBindingResult()
        .getFieldErrors()
        .stream()
        .map(error -> error.getField() + ": " + error.getDefaultMessage())
        .findFirst()
        .orElse("입력값이 올바르지 않습니다.");
    
    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
        .body(ApiResponse.error(errorMessage));
  }

  /**
   * 기타 모든 예외 처리
   */
  @ExceptionHandler(Exception.class)
  public ResponseEntity<ApiResponse<String>> handleException(Exception e) {
    log.error("예상치 못한 예외 발생: ", e);
    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
        .body(ApiResponse.error("서버 내부 오류가 발생했습니다."));
  }
}
