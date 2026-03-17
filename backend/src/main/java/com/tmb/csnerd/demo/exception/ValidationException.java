package com.tmb.csnerd.demo.exception;

import lombok.Getter;
import java.util.List;

@Getter
public class ValidationException extends RuntimeException {
    private final List<String> errors;

    public ValidationException(String message) {
        super(message);
        this.errors = List.of(message);
    }

    public ValidationException(List<String> errors) {
        super(errors.isEmpty() ? "Validation failed" : String.join(", ", errors));
        this.errors = errors;
    }
}
