/**
 * Analysis Controller
 * Phase 7: API Endpoints
 *
 * REST API endpoints for pitch deck analysis
 */
import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  Query,
  Request,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@core/guard/jwt.auth.guard';
import { AnalysisService } from './services/analysis.service';
import { StartAnalysisDto } from './dto/start-analysis.dto';
import { ListAnalysisDto } from './dto/list-analysis.dto';
import { AnalysisResponseDto } from './dto/analysis-response.dto';
import { AnalysisStatusDto } from './dto/analysis-status.dto';
import { AnalysisTransformInterceptor } from './interceptors/transform.interceptor';
import { AnalysisRateLimitGuard } from './guards/rate-limit.guard';

@ApiTags('analysis')
@Controller('analysis')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@UseInterceptors(AnalysisTransformInterceptor)
export class AnalysisController {
  constructor(private readonly analysisService: AnalysisService) {}

  @Post('start')
  @ApiOperation({ summary: 'Start pitch deck analysis' })
  @ApiResponse({
    status: 201,
    description: 'Analysis started successfully',
    type: AnalysisResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 429, description: 'Rate limit exceeded' })
  @UseGuards(AnalysisRateLimitGuard)
  async startAnalysis(
    @Body() dto: StartAnalysisDto,
    @Request() req: { user: { sub: string } },
  ): Promise<AnalysisResponseDto> {
    const ownerId = req.user.sub;
    const analysis = await this.analysisService.startAnalysis(
      dto.deckId,
      ownerId,
    );
    return AnalysisResponseDto.fromEntity(analysis);
  }

  @Get(':uuid/status')
  @ApiOperation({ summary: 'Get analysis status' })
  @ApiResponse({
    status: 200,
    description: 'Analysis status',
    type: AnalysisStatusDto,
  })
  @ApiResponse({ status: 404, description: 'Analysis not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getAnalysisStatus(
    @Param('uuid') uuid: string,
    @Request() req: { user: { sub: string } },
  ): Promise<AnalysisStatusDto> {
    const ownerId = req.user.sub;
    const status = await this.analysisService.getAnalysisStatus(uuid, ownerId);
    return AnalysisStatusDto.fromEntity(status);
  }

  @Get(':uuid')
  @ApiOperation({ summary: 'Get full analysis result' })
  @ApiResponse({
    status: 200,
    description: 'Analysis result',
    type: AnalysisResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Analysis not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getAnalysis(
    @Param('uuid') uuid: string,
    @Request() req: { user: { sub: string } },
  ): Promise<AnalysisResponseDto> {
    const ownerId = req.user.sub;
    const analysis = await this.analysisService.getAnalysisResult(
      uuid,
      ownerId,
    );
    return AnalysisResponseDto.fromEntity(analysis);
  }

  @Get()
  @ApiOperation({ summary: 'List user analyses' })
  @ApiResponse({
    status: 200,
    description: 'List of analyses',
    type: [AnalysisResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async listAnalyses(
    @Request() req: { user: { sub: string } },
    @Query() query: ListAnalysisDto,
  ): Promise<AnalysisResponseDto[]> {
    const ownerId = req.user.sub;
    const analyses = await this.analysisService.listAnalyses(ownerId, {
      status: query.status,
      limit: query.limit,
      offset: query.offset,
    });
    return analyses.map((a) => AnalysisResponseDto.fromEntity(a));
  }

  @Get('by-deck/:deckUuid')
  @ApiOperation({ summary: 'Get analysis by pitch deck UUID' })
  @ApiResponse({
    status: 200,
    description: 'Analysis result for the specified deck',
    type: AnalysisResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Analysis or deck not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getAnalysisByDeck(
    @Param('deckUuid') deckUuid: string,
    @Request() req: { user: { sub: string } },
  ): Promise<AnalysisResponseDto> {
    const ownerId = req.user.sub;
    const analysis = await this.analysisService.getAnalysisByDeck(
      deckUuid,
      ownerId,
    );
    return AnalysisResponseDto.fromEntity(analysis);
  }

  @Delete(':uuid')
  @ApiOperation({ summary: 'Cancel or delete analysis' })
  @ApiResponse({
    status: 200,
    description: 'Analysis deleted',
  })
  @ApiResponse({ status: 404, description: 'Analysis not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async deleteAnalysis(
    @Param('uuid') uuid: string,
    @Request() req: { user: { sub: string } },
  ): Promise<{ success: boolean }> {
    const ownerId = req.user.sub;
    await this.analysisService.deleteAnalysis(uuid, ownerId);
    return { success: true };
  }
}
