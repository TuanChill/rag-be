import { ApiProperty } from '@nestjs/swagger';
import { AnalysisStatus, AgentStatus } from '../types/analysis.types';

/**
 * Individual agent status
 */
export class AgentStatusDto {
  @ApiProperty({ description: 'Agent name' })
  agentName!: string;

  @ApiProperty({ description: 'Agent status' })
  status!: AgentStatus;

  @ApiProperty({ description: 'Execution order' })
  executionOrder!: number;

  @ApiProperty({ description: 'Progress percentage', required: false })
  progress?: number;

  @ApiProperty({ description: 'Error message if failed', required: false })
  errorMessage?: string;
}

/**
 * Analysis status response
 * Used for polling analysis progress
 */
export class AnalysisStatusDto {
  @ApiProperty({ description: 'Analysis UUID' })
  uuid!: string;

  @ApiProperty({ description: 'Current status' })
  status!: AnalysisStatus;

  @ApiProperty({ description: 'Overall progress (0-100)' })
  progress!: number;

  @ApiProperty({ description: 'Current step description', required: false })
  currentStep?: string;

  @ApiProperty({ type: [AgentStatusDto], description: 'Agent statuses' })
  agents!: AgentStatusDto[];

  @ApiProperty({ description: 'Job ID for tracking', required: false })
  jobId?: string;

  @ApiProperty({ description: 'Error message if failed', required: false })
  errorMessage?: string;

  @ApiProperty({ description: 'Start timestamp', required: false })
  startedAt?: Date;

  /**
   * Create from analysis entity
   */
  static fromEntity(data: {
    uuid: string;
    status: AnalysisStatus;
    progress: number;
    currentStep: string;
    agents: Array<{
      agentName: string;
      status: AgentStatus;
      executionOrder: number;
      errorMessage?: string;
    }>;
    errorMessage?: string;
    startedAt?: Date;
  }): AnalysisStatusDto {
    return {
      uuid: data.uuid,
      status: data.status,
      progress: data.progress,
      currentStep: data.currentStep,
      agents: data.agents.map((a) => ({
        agentName: a.agentName,
        status: a.status,
        executionOrder: a.executionOrder,
        errorMessage: a.errorMessage,
      })),
      errorMessage: data.errorMessage,
      startedAt: data.startedAt,
    };
  }
}
