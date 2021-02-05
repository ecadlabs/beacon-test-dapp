export interface TestSettings {
  id: string;
  name: string;
  description: string;
  run: any;
  showExecutionTime: boolean;
  inputRequired: boolean;
}

export interface TestResult {
  success: boolean;
  opHash: string;
  output?: string;
}
