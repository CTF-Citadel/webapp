import { ConsoleLogger, Log, Severity } from "@cross/log";

export const Logger = new Log([
  new ConsoleLogger({
    minimumSeverity: Severity.Info,
  }),
]);
