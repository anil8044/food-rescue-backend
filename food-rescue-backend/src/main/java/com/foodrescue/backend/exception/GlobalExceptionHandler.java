package com.foodrescue.backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.util.stream.Collectors;

/**
 * Global exception handler for REST API endpoints.
 * Provides consistent error responses across all controllers.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    /** Validation errors (@Valid failures). */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationExceptions(
            MethodArgumentNotValidException ex, WebRequest request) {

        String detail = ex.getBindingResult().getFieldErrors().stream()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .collect(Collectors.joining(", "));

        return build(HttpStatus.BAD_REQUEST, "Validation failed", detail, request);
    }

    /** Malformed JSON or an invalid enum value inside a request body. */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorResponse> handleUnreadableBody(
            HttpMessageNotReadableException ex, WebRequest request) {

        return build(HttpStatus.BAD_REQUEST, "Invalid request body",
                "The request body is malformed or contains an invalid value, such as an unknown severity or category.",
                request);
    }

    /** An invalid value in a URL path or query parameter (e.g. an unknown status). */
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ErrorResponse> handleTypeMismatch(
            MethodArgumentTypeMismatchException ex, WebRequest request) {

        return build(HttpStatus.BAD_REQUEST, "Invalid parameter",
                "Invalid value '" + ex.getValue() + "' for parameter '" + ex.getName() + "'.",
                request);
    }

    /** A required query parameter was not supplied (e.g. donorId). */
    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<ErrorResponse> handleMissingParameter(
            MissingServletRequestParameterException ex, WebRequest request) {

        return build(HttpStatus.BAD_REQUEST, "Missing parameter",
                "Required parameter '" + ex.getParameterName() + "' is missing.",
                request);
    }

    /** A URL that doesn't match any endpoint, for example a mistyped address. */
    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<ErrorResponse> handleNoEndpoint(
            NoResourceFoundException ex, WebRequest request) {

        return build(HttpStatus.NOT_FOUND, "Not Found",
                "There is no endpoint at this address.", request);
    }

    /** Failed login attempts. */
    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<ErrorResponse> handleUnauthorized(
            UnauthorizedException ex, WebRequest request) {

        return build(HttpStatus.UNAUTHORIZED, "Unauthorized", ex.getMessage(), request);
    }

    /**
     * Services throw a plain RuntimeException(message) for deliberate failures,
     * such as "Donation not found" or "Recipient organisation must be approved".
     * Those become 404 (if the message says "not found") or 400 with the message.
     * Any more specific RuntimeException (NullPointerException etc.) is an
     * unexpected bug and stays a 500.
     */
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ErrorResponse> handleRuntimeException(
            RuntimeException ex, WebRequest request) {

        String message = ex.getMessage();

        if (ex.getClass().equals(RuntimeException.class) && message != null) {
            HttpStatus status = message.contains("not found")
                    ? HttpStatus.NOT_FOUND
                    : HttpStatus.BAD_REQUEST;
            return build(status, status.getReasonPhrase(), message, request);
        }

        return build(HttpStatus.INTERNAL_SERVER_ERROR,
                HttpStatus.INTERNAL_SERVER_ERROR.getReasonPhrase(), message, request);
    }

    /** Everything else. */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGlobalException(
            Exception ex, WebRequest request) {

        return build(HttpStatus.INTERNAL_SERVER_ERROR, "Internal server error",
                ex.getMessage(), request);
    }

    private ResponseEntity<ErrorResponse> build(
            HttpStatus status, String message, String detail, WebRequest request) {

        ErrorResponse errorResponse = new ErrorResponse(status.value(), message, detail);
        errorResponse.setPath(request.getDescription(false).replace("uri=", ""));
        return new ResponseEntity<>(errorResponse, status);
    }
}