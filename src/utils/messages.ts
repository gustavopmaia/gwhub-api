export function successMessage(data?: any) {
  return {
    message: "Operation successful",
    statusCode: 200,
    data,
  }
}

export function errorMessage(message: string, statusCode: number = 500, error?: string) {
  return {
    message,
    statusCode,
    error,
  }
}

export function infoMessage(message: string) {
  return {
    message,
    statusCode: 200,
  }
}
