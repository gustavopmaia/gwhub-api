export function successMessage(data) {
    return {
        message: "Operation successful",
        statusCode: 200,
        data,
    };
}
export function errorMessage(message, statusCode = 500, error) {
    return {
        message,
        statusCode,
        error,
    };
}
export function infoMessage(message) {
    return {
        message,
        statusCode: 200,
    };
}
