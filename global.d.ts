/** @format */

export {};

declare global {
  namespace Express {
    interface Request {
      session?: {
        id: string;
        [key: string]: any;
      };
    }
  }
  namespace NodeJS {
    interface Global {
      config: {
        observatoryEnabled: boolean;
        observatoryPaused: boolean;
      };
    }
  }
}
