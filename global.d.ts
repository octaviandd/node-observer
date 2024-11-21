export { }

declare global {
  namespace NodeJS {
    interface Global {
     config: {
       observatoryEnabled: boolean,
       observatoryPaused: boolean
     }
    }
  }
}