export interface TestResult {
  success: boolean;
  opHash: string;
  output?: string;
  sigDetails?: { input: string; formattedInput: string; bytes: string };
}

export interface TestSettings {
  id: string;
  name: string;
  description: string;
  run: (input: any) => Promise<TestResult>;
  showExecutionTime: boolean;
  inputRequired: boolean;
}
