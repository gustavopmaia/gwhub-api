interface Message {
  message: string;
  statusCode?: number;
}

interface SuccessMessage extends Message {
  data?: any;
}

interface ErrorMessage extends Message {
  error?: string;
}

interface InfoMessage extends Message {}
