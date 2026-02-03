# Category Analysis Agents Documentation

## Overview

The Category Analysis Agents are specialized AI agents that analyze pitch decks across six key categories. Each agent uses structured prompts and the RAG system to provide comprehensive insights with scores, findings, and recommendations.

## Architecture

### Base Agent Class
All category agents extend from `BaseAgent` which provides:
- Common configuration and logging
- Error handling and retry logic
- Intermediate step tracking for debugging
- Tool integration (RAG and OpenAI)

### Agent Workflow
1. **RAG Query**: Query the pitch deck content for relevant information
2. **Prompt Generation**: Generate category-specific prompts with retrieved content
3. **LLM Analysis**: Process through OpenAI with structured prompts
4. **Response Parsing**: Parse and validate LLM response
5. **Output Formatting**: Format output according to category interface

## Agent Implementations

### 1. Overall Assessment Agent

**File**: `src/agents/analysis/overall-assessment.agent.ts`

**Purpose**: Synthesizes overall pitch deck quality and investment readiness

**Key Responsibilities**:
- Evaluate overall narrative flow and coherence
- Assess clarity of value proposition
- Identify primary strengths and weaknesses
- Provide investment readiness score

**Prompt Structure**:
```typescript
OVERALL_ASSESSMENT_SYSTEM_PROMPT: System-level instructions for analysis
OVERALL_ASSESSMENT_PROMPT(content): User-specific prompt with deck content
```

**Output Structure**:
```typescript
{
  category: 'overall_assessment',
  score: number, // 0-100
  summary: string, // 2-3 sentence overview
  findings: [
    {
      title: string,
      description: string,
      impact: 'positive' | 'negative' | 'neutral',
      severity: 'critical' | 'major' | 'minor',
      recommendations: string[],
      evidence: { quote?: string, slideNumber?: number }
    }
  ],
  metadata: {
    executionTime: number,
    agent: 'overall_assessment',
    findingCount: number
  }
}
```

### 2. Market Opportunity Agent

**File**: `src/agents/analysis/market-opportunity.agent.ts`

**Purpose**: Analyzes market size, growth potential, and target market validation

**Key Responsibilities**:
- Evaluate Total Addressable Market (TAM) claims
- Assess market growth trends and validation
- Identify market entry barriers
- Validate target market specificity

**Analysis Focus Areas**:
- Market size claims and supporting data
- Growth rate and market trends
- Target market validation
- Competitive landscape saturation

**Sample Findings**:
```typescript
{
  title: "Market Size Validation",
  description: "Market size claim lacks supporting data points",
  impact: "negative",
  severity: "critical",
  recommendations: [
    "Add market research citations",
    "Include historical growth data"
  ],
  evidence: {
    quote: "$10B market opportunity",
    slideNumber: 5
  }
}
```

### 3. Business Model Agent

**File**: `src/agents/analysis/business-model.agent.ts`

**Purpose**: Evaluates business model viability, revenue streams, and competitive advantages

**Key Responsibilities**:
- Assess revenue streams and pricing strategy
- Evaluate business model scalability
- Analyze unit economics and margins
- Identify sustainable competitive advantages

**Business Model Evaluation**:
- Multiple revenue streams identification
- Pricing strategy reasonableness
- Cost structure analysis
- Path to profitability

**Output Examples**:
```typescript
{
  title: "Revenue Stream Clarity",
  description: "Multiple revenue streams identified but pricing lacks detail",
  impact: "neutral",
  severity: "minor",
  recommendations: [
    "Develop detailed pricing tiers",
    "Add customer acquisition cost analysis"
  ],
  evidence: {
    quote: "SaaS subscription + transaction fees",
    slideNumber: 8
  }
}
```

### 4. Team Execution Agent

**File**: `src/agents/analysis/team-execution.agent.ts`

**Purpose**: Analyzes team composition, experience, and execution capabilities

**Key Responsibilities**:
- Evaluate team experience and expertise
- Assess industry knowledge relevance
- Review previous successes and failures
- Evaluate operational capabilities

**Team Assessment Criteria**:
- Relevant industry experience
- Previous track record
- Team complementarity
- Execution capability

**Finding Classification**:
- Positive: Strong team background, relevant experience
- Negative: Gaps in key areas, no relevant experience
- Neutral: adequate but not exceptional

### 5. Financial Projections Agent

**File**: `src/agents/analysis/financial-projections.agent.ts`

**Purpose**: Validates financial projection assumptions and reasonableness

**Key Responsibilities**:
- Validate revenue projection assumptions
- Assess expense structure and burn rate
- Evaluate path to profitability
- Identify financial risks

**Financial Analysis Areas**:
- Revenue growth assumptions
- Operating expense structure
- Gross margins and unit economics
- Cash flow and runway

**Recommendation Examples**:
```typescript
{
  recommendations: [
    "Add detailed financial model assumptions",
    "Include sensitivity analysis for key variables",
    "Provide monthly cash flow projections"
  ]
}
```

### 6. Competitive Landscape Agent

**File**: `src/agents/analysis/competitive-landscape.agent.ts`

**Purpose**: Evaluates competitive positioning and market differentiation

**Key Responsibilities**:
- Map competitive landscape
- Identify key differentiators
- Assess market saturation
- Evaluate competitive advantages

**Competitive Analysis**:
- Direct and indirect competitors
- Market positioning clarity
- Unique value proposition strength
- Competitive barriers

## Agent Configuration

### Configuration Parameters
```typescript
config: AgentConfig = {
  name: string,
  description: string,
  timeout: number, // ms (default: 120000)
  maxRetries: number, // (default: 3)
  temperature: number // (default: 0.7)
}
```

### Environment Variables
- `ANALYSIS_TIMEOUT_MS`: Timeout for agent execution (default: 120000)
- `ANALYSIS_TEMPERATURE`: LLM temperature for creativity (default: 0.7)
- `OPENAI_API_KEY`: OpenAI API key for LLM calls

## Error Handling

### Common Error Types
1. **RAG Query Failures**
   - Invalid deck ID
   - Document retrieval errors
   - Vector search failures

2. **LLM Response Parsing**
   - Malformed JSON responses
   - Missing required fields
   - Invalid score ranges

3. **Timeout Errors**
   - Agent execution timeout
   - LLM response timeout
   - Tool call timeout

### Error Recovery
- Automatic retry with exponential backoff
- Fallback to simplified prompt
- Error logging with context
- Graceful degradation

## Testing Strategy

### Unit Tests
- Agent initialization and configuration
- Prompt generation accuracy
- Response parsing validation
- Error handling scenarios

### Integration Tests
- End-to-end agent workflow
- RAG tool integration
- LLM response processing
- Score normalization

### Performance Tests
- Response time benchmarks
- Concurrent agent execution
- Large document processing
- Memory usage patterns

## Prompt Engineering

### Prompt Structure
All agents follow a consistent prompt structure:

1. **System Prompt**: High-level analysis instructions
2. **Context**: Retrieved content from RAG system
3. **Task**: Specific analysis requirements
4. **Output Format**: Structured JSON response

### Prompt Optimization
- Few-shot examples for better output
- Clear output format instructions
- Bias mitigation techniques
- Constraint validation

### Output Validation
- Score range enforcement (0-100)
- Finding impact validation
- Required field checks
- Type safety enforcement

## Agent Interactions

### Data Flow
```
Pitch Deck → RAG Query → Agent Prompt → LLM Response → Parsed Output → Category Response
```

### Shared Resources
- RAG Tool: Content retrieval and vector search
- OpenAI Tool: LLM analysis and response generation
- Configuration Service: Agent parameter management
- Logger: Debugging and monitoring

### Agent Coordination
- Independent execution for each category
- No inter-agent dependencies
- Parallel processing for efficiency
- Result aggregation in orchestrator

## Future Enhancements

### Agent Improvements
1. **Real-time Updates**
   - Streaming response processing
   - Progressive result reporting
   - Status tracking

2. **Enhanced Analysis**
   - Historical comparison
   - Industry-specific benchmarks
   - Sentiment analysis

3. **Personalization**
   - Category weight customization
   - Focus area selection
   - Report formatting preferences

### Integration Features
1. **Webhook Support**
   - Real-time notifications
   - Progress updates
   - Completion alerts

2. **Advanced Analytics**
   - Trend analysis
   - Historical performance
   - Comparative insights

3. **API Enhancements**
   - Batch processing
   - Caching layer
   - Rate limiting

## Troubleshooting

### Common Issues
1. **Slow Agent Execution**
   - Check RAG query performance
   - Optimize prompt length
   - Adjust timeout settings

2. **Inconsistent Scores**
   - Validate prompt instructions
   - Check LLM temperature
   - Review output validation

3. **Missing Findings**
   - Verify RAG retrieval relevance
   - Adjust search queries
   - Improve prompt clarity

### Debug Mode
Enable debug logging for detailed agent execution:
```typescript
// In agent configuration
config: {
  debug: true,
  logLevel: 'debug'
}
```

### Performance Monitoring
- Track agent execution times
- Monitor LLM response quality
- Analyze RAG retrieval accuracy
- Score distribution analysis