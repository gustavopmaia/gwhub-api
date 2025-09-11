export function successMessage(data?: any): SuccessMessage {
  return {
    message: "Operation successful",
    statusCode: 200,
    data,
  };
}

export function errorMessage(
  message: string,
  statusCode: number = 500,
  error?: string,
): ErrorMessage {
  return {
    message,
    statusCode,
    error,
  };
}

export function infoMessage(message: string): InfoMessage {
  return {
    message,
    statusCode: 200,
  };
}
