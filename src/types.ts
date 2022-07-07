export interface TestResult {
  success: boolean;
  opHash: string;
  output?: string;
  sigDetails?: { input: string; formattedInput: string; bytes: string };
  confirmationObsOutput?: { level: number; currentConfirmation: number }[];
}

export interface TestSettings {
  id: string;
  name: string;
  description: string;
  run: (input: any) => Promise<TestResult>;
  showExecutionTime: boolean;
  inputRequired: boolean;
  inputType?: "string" | "set-limits";
}

export enum AvailableNetwork {
  "ITHACANET" = "ithacanet",
  "JAKARTANET" = 'jakartanet',
  "MAINNET" = "mainnet",
  "CUSTOM" = "custom"
}
