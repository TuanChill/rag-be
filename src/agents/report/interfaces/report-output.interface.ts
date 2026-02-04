export interface ReportSection {
  title: string;
  content: string;
  order: number;
}

export interface ReportOutput {
  title: string;
  executiveSummary: string;
  sections: ReportSection[];
  recommendations: string[];
  conclusion: string;
  metadata: {
    generatedAt: Date;
    analysisUuid: string;
    reportType: string;
    wordCount: number;
  };
}
