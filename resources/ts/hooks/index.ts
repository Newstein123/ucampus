export interface ErrorResponse {
    errors: {
      [key: string]: string[] | string;
    };
    message: string;
  }