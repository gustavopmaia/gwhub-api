"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.successMessage = successMessage;
exports.errorMessage = errorMessage;
exports.infoMessage = infoMessage;
function successMessage(data) {
    return {
        message: "Operation successful",
        statusCode: 200,
        data,
    };
}
function errorMessage(message, statusCode = 500, error) {
    return {
        message,
        statusCode,
        error,
    };
}
function infoMessage(message) {
    return {
        message,
        statusCode: 200,
    };
}
