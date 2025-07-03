import { collectorOptions, OTEL_CONFIG } from "@/context/otel-provider";
import { OTLPLogExporter } from "@opentelemetry/exporter-logs-otlp-http";
import {
  LoggerProvider,
  BatchLogRecordProcessor,
} from "@opentelemetry/sdk-logs";

interface loggerType {
  severityNumber: number;
  severityText: string;
  body: string;
  attributes: Record<string, string>;
}

export const logger = (loggerData: loggerType) => {
  const collectorOptionsForLogs = {
    url: `${OTEL_CONFIG.baseUrl}/v1/logs`,
    ...collectorOptions,
  };
  const logExporter = new OTLPLogExporter(collectorOptionsForLogs);
  const loggerProvider = new LoggerProvider();
  loggerProvider.addLogRecordProcessor(
    new BatchLogRecordProcessor(logExporter),
  );
  const logger = loggerProvider.getLogger("default", "1.0.0");

  logger.emit(loggerData);
};
