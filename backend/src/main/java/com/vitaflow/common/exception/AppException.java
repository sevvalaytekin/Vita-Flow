package com.vitaflow.common.exception;

public class AppException extends RuntimeException {

    private final ErrorCode errorCode;

    // 🔥 main constructor
    public AppException(ErrorCode errorCode, String message) {
        super(message);
        this.errorCode = errorCode;
    }

    // 🔥 sadece errorCode (default message)
    public AppException(ErrorCode errorCode) {
        super(errorCode.name());
        this.errorCode = errorCode;
    }

    // 🔥 cause support (çok önemli)
    public AppException(ErrorCode errorCode, String message, Throwable cause) {
        super(message, cause);
        this.errorCode = errorCode;
    }

    public ErrorCode getErrorCode() {
        return errorCode;
    }
}