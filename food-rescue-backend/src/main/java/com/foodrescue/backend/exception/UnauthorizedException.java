package com.foodrescue.backend.exception;

/**
 * Thrown when a login attempt fails. Handled by GlobalExceptionHandler as a 401.
 */
public class UnauthorizedException extends RuntimeException {

    public UnauthorizedException(String message) {
        super(message);
    }
}