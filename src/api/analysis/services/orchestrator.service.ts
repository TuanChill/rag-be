/**
 * Agent Orchestrator Service
 * Phase 6: Orchestration Service
 *
 * Coordinates execution of all agents (4 scoring + 3 analysis)
 */
import { Injectable, Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { InjectRepository } from '@mikro-orm/nestjs';
import {
  EntityManager,
  EntityRepository,
  Reference,
  wrap,
} from '@mikro-orm/core';
import { ObjectId } from '@mikro-orm/mongodb';
import { SectorMatchAgent } from '@agents/scoring/sector-match.agent';
import { StageMatchAgent } from '@agents/scoring/stage-match.agent';
import { ThesisOverlapAgent } from '@agents/scoring/thesis-overlap.agent';
import { HistoryBehaviorAgent } from '@agents/scoring/history-behavior.agent';
import { StrengthsAgent } from '@agents/analysis/strengths.agent';
import { WeaknessesAgent } from '@agents/analysis/weaknesses.agent';
import { CompetitiveAgent } from '@agents/analysis/competitive.agent';
import { FindingDeduplicatorUtil } from '@agents/analysis/utils/finding-deduplicator.util';
import { Finding } from '@agents/analysis/interfaces/finding.interface';
import { AnalysisResult } from '../entities/analysis-result.entity';
import { AnalysisScore } from '../entities/analysis-score.entity';
import { AnalysisFinding } from '../entities/analysis-finding.entity';
import { AgentState } from '../entities/agent-state.entity';
import {
  AnalysisStatus,
  AgentStatus,
  ScoreCategory,
  FindingType,
  FindingSeverity,
} from '../types/analysis.types';
import { CalculatorService } from './calculator.service';
import { EventsService } from '@core/events/events.service';
import { AgentInput } from '@core/agents/types/agent.types';
import { PitchDeck } from '@api/pitchdeck/entities/pitch-deck.entity';
import { User } from '@api/user/entities/user.entity';

@Injectable()
export class OrchestratorService {
  private readonly logger = new Logger(OrchestratorService.name);

  constructor(
    @InjectRepository(AnalysisResult)
    private readonly analysisRepository: EntityRepository<AnalysisResult>,
    @InjectRepository(AnalysisScore)
    private readonly scoreRepository: EntityRepository<AnalysisScore>,
    @InjectRepository(AnalysisFinding)
    private readonly findingRepository: EntityRepository<AnalysisFinding>,
    @InjectRepository(AgentState)
    private readonly agentStateRepository: EntityRepository<AgentState>,
    private readonly em: EntityManager,
    private readonly sectorAgent: SectorMatchAgent,
    private readonly stageAgent: StageMatchAgent,
    private readonly thesisAgent: ThesisOverlapAgent,
    private readonly historyAgent: HistoryBehaviorAgent,
    private readonly strengthsAgent: StrengthsAgent,
    private readonly weaknessesAgent: WeaknessesAgent,
    private readonly competitiveAgent: CompetitiveAgent,
    private readonly calculator: CalculatorService,
    private readonly events: EventsService,
  ) {}

  async executeAnalysis(
    deckId: string,
    ownerId: string,
    deckUuid: string,
  ): Promise<AnalysisResult> {
    this.logger.log(`Starting analysis for deck: ${deckId}`);

    // Create AnalysisResult entity
    const analysis = this.analysisRepository.create({
      uuid: uuidv4(),
      status: 'running' as AnalysisStatus,
      startedAt: new Date(),
      deck: Reference.createFromPK(PitchDeck, new ObjectId(deckId)),
      owner: Reference.createFromPK(User, new ObjectId(ownerId)),
      analysisType: 'full',
    });

    this.em.persist(analysis);
    await this.em.flush();

    try {
      // Emit start event
      this.events.emitAnalysisProgress({
        deckId: deckUuid,
        progress: 0,
        step: 'Initializing',
      });

      // Execute scoring agents (parallel)
      const scoringResults = await this.executeScoringAgents(
        analysis,
        deckId,
        deckUuid,
      );

      // Execute analysis agents (parallel)
      const analysisResults = await this.executeAnalysisAgents(
        analysis,
        deckId,
        deckUuid,
      );

      // Calculate overall score
      const overallScore =
        this.calculator.calculateOverallScore(scoringResults);

      // Update analysis with results
      wrap(analysis).assign({
        overallScore,
        status: 'completed' as AnalysisStatus,
        completedAt: new Date(),
      });

      await this.em.flush();

      // Emit completion event
      this.events.emitAnalysisCompleted({
        deckId: deckUuid,
        result: {
          uuid: analysis.uuid,
          overallScore,
        },
      });

      this.logger.log(`Analysis completed: ${analysis.uuid}`);
      return analysis;
    } catch (error) {
      this.logger.error(`Analysis failed for deck: ${deckId}`, error);

      wrap(analysis).assign({
        status: 'failed' as AnalysisStatus,
        completedAt: new Date(),
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      });

      await this.em.flush();
      throw error;
    }
  }

  private async executeScoringAgents(
    analysis: AnalysisResult,
    deckId: string,
    deckUuid: string,
  ): Promise<AnalysisScore[]> {
    const agents = [
      { agent: this.sectorAgent, order: 1, name: 'SectorMatchAgent' },
      { agent: this.stageAgent, order: 2, name: 'StageMatchAgent' },
      { agent: this.thesisAgent, order: 3, name: 'ThesisOverlapAgent' },
      { agent: this.historyAgent, order: 4, name: 'HistoryBehaviorAgent' },
    ];

    const results: AnalysisScore[] = [];

    for (const { agent, order, name } of agents) {
      this.events.emitAnalysisProgress({
        deckId: deckUuid,
        progress: Math.round((order / 7) * 100),
        step: `Running ${name}`,
      });

      const agentState = this.agentStateRepository.create({
        agentName: name,
        status: 'running' as AgentStatus,
        executionOrder: order,
        analysis,
      });
      this.em.persist(agentState);
      await this.em.flush();

      try {
        const input: AgentInput = { deckId };
        const result = await agent.execute(input);

        if (result.success && result.data) {
          const scoreData = result.data as {
            category: string;
            score: number;
            weight: number;
            justification: string;
          };

          const score = this.scoreRepository.create({
            category: scoreData.category as ScoreCategory,
            score: scoreData.score,
            weight: scoreData.weight,
            details: scoreData.justification,
            analysis,
          });
          this.em.persist(score);
          await this.em.flush();
          results.push(score);

          wrap(agentState).assign({ status: 'completed' as AgentStatus });
        } else {
          wrap(agentState).assign({
            status: 'failed' as AgentStatus,
            errorMessage: result.error,
          });
        }

        await this.em.flush();
      } catch (error) {
        wrap(agentState).assign({
          status: 'failed' as AgentStatus,
          errorMessage:
            error instanceof Error ? error.message : 'Unknown error',
        });
        await this.em.flush();
        this.logger.error(`${name} failed`, error);
      }
    }

    return results;
  }

  private async executeAnalysisAgents(
    analysis: AnalysisResult,
    deckId: string,
    deckUuid: string,
  ): Promise<Finding[]> {
    const agents = [
      { agent: this.strengthsAgent, order: 5, name: 'StrengthsAgent' },
      { agent: this.weaknessesAgent, order: 6, name: 'WeaknessesAgent' },
      { agent: this.competitiveAgent, order: 7, name: 'CompetitiveAgent' },
    ];

    const allFindings: unknown[] = [];

    for (const { agent, order, name } of agents) {
      this.events.emitAnalysisProgress({
        deckId: deckUuid,
        progress: Math.round((order / 7) * 100),
        step: `Running ${name}`,
      });

      const agentState = this.agentStateRepository.create({
        agentName: name,
        status: 'running' as AgentStatus,
        executionOrder: order,
        analysis,
      });
      this.em.persist(agentState);
      await this.em.flush();

      try {
        const input: AgentInput = { deckId };
        const result = await agent.execute(input);

        if (result.success && result.data) {
          const outputData = result.data as {
            findings: unknown[];
            summary: string;
          };

          allFindings.push(...outputData.findings);

          for (const finding of outputData.findings) {
            const findingData = finding as {
              type: string;
              title: string;
              description: string;
              severity: string;
              source: string;
            };

            const findingEntity = this.findingRepository.create({
              type: findingData.type as FindingType,
              title: findingData.title,
              description: findingData.description,
              severity: findingData.severity as FindingSeverity,
              source: findingData.source,
              analysis,
            });
            this.em.persist(findingEntity);
            await this.em.flush();
          }

          wrap(agentState).assign({ status: 'completed' as AgentStatus });
        } else {
          wrap(agentState).assign({
            status: 'failed' as AgentStatus,
            errorMessage: result.error,
          });
        }

        await this.em.flush();
      } catch (error) {
        wrap(agentState).assign({
          status: 'failed' as AgentStatus,
          errorMessage:
            error instanceof Error ? error.message : 'Unknown error',
        });
        await this.em.flush();
        this.logger.error(`${name} failed`, error);
      }
    }

    return FindingDeduplicatorUtil.deduplicate(allFindings as Finding[]);
  }
}
