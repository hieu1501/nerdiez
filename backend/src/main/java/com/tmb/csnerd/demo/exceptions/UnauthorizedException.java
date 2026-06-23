package com.tmb.csnerd.demo.exceptions;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public class UnauthorizedException extends RuntimeException {
    private final HttpStatus errorCode;

    public UnauthorizedException(HttpStatus errorCode) {
        super(errorCode == HttpStatus.UNAUTHORIZED ? "User not found" : "Unauthorized");
        this.errorCode = errorCode;
    }
}
