package com.yeahyak.backend.exception;


import com.yeahyak.backend.dto.JinhoResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;


@RestControllerAdvice
public class GlobalExceptionHandler {


    @ExceptionHandler(FlaskPredictException.class)
    public ResponseEntity<JinhoResponse<Object>> handleFlaskError(FlaskPredictException e) {
        return ResponseEntity.badRequest().body(new JinhoResponse<>(false, null, 0, 0, 0));
    }
}