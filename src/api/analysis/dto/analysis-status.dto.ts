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
}
