# Category Analysis API Documentation

## Overview

The Category Analysis API provides endpoints for analyzing pitch decks across six key categories. The API returns structured, UI-compatible responses optimized for frontend rendering.

## Base URL

```
/api/analysis
```

## Authentication

All endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

## Endpoints

### 1. Create Analysis

**POST** `/api/analysis`

Initiates a new analysis job for a pitch deck.

**Request Body:**
```json
{
  "deckId": "uuid",
  "analysisType": "full",
  "categoryWeights": {
    "overall_assessment": 0.20,
    "market_opportunity": 0.20,
    "business_model": 0.20,
    "team_execution": 0.20,
    "financial_projections": 0.10,
    "competitive_landscape": 0.10
  }
}
```

**Response:**
```json
{
  "uuid": "analysis-uuid",
  "status": "queued",
  "deckId": "deck-uuid",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### 2. Get Analysis Results (Legacy Format)

**GET** `/api/analysis/:uuid`

Returns analysis results in the original format.

**Response:**
```json
{
  "uuid": "analysis-uuid",
  "overallScore": 75,
  "status": "completed",
  "analysisType": "full",
  "scores": [
    {
      "category": "overall_assessment",
      "score": 80,
      "weight": 0.20,
      "details": "Strong value proposition",
      "sourceAgent": "overall_assessment"
    }
  ],
  "findings": [
    {
      "type": "strength",
      "title": "Clear value proposition",
      "description": "The pitch deck clearly articulates the unique value proposition",
      "severity": "major",
      "source": "overall_assessment",
      "reference": "slide 3"
    }
  ],
  "createdAt": "2024-01-01T00:00:00.000Z",
  "completedAt": "2024-01-01T00:05:00.000Z",
  "deckId": "deck-uuid"
}
```

### 3. Get Analysis Results (UI Format - Phase 9)

**GET** `/api/analysis/:uuid/ui`

Returns analysis results in UI-compatible format with categorized analysis.

**Response:**
```json
{
  "uuid": "analysis-uuid",
  "deckId": "deck-uuid",
  "status": "completed",
  "overallScore": 75,
  "overallAssessment": {
    "score": 80,
    "summary": "The pitch deck demonstrates strong overall quality with clear value proposition",
    "findings": [
      {
        "title": "Clear Value Proposition",
        "description": "The pitch deck clearly articulates the unique value proposition and market opportunity",
        "impact": "positive",
        "severity": "major",
        "recommendations": [
          "Consider adding more specific market validation data"
        ],
        "evidence": {
          "quote": "Our platform addresses the $10B market gap",
          "slideNumber": 3
        }
      }
    ],
    "isExpanded": true
  },
  "marketOpportunity": {
    "score": 70,
    "summary": "Significant market opportunity with growth potential",
    "findings": [
      {
        "title": "Market Size Validation",
        "description": "Market size claim lacks supporting data",
        "impact": "negative",
        "severity": "critical",
        "recommendations": [
          "Add market research data to support claims",
          "Include competitor analysis and market share data"
        ],
        "evidence": {
          "slideNumber": 5
        }
      }
    ],
    "isExpanded": false
  },
  "businessModel": {
    "score": 75,
    "summary": "Solid business model with clear revenue streams",
    "findings": [
      {
        "title": "Revenue Streams",
        "description": "Multiple revenue streams identified but pricing strategy needs refinement",
        "impact": "neutral",
        "severity": "minor",
        "recommendations": [
          "Develop detailed pricing tiers",
          "Add customer acquisition cost analysis"
        ],
        "evidence": {
          "quote": "SaaS subscription + transaction fees",
          "slideNumber": 8
        }
      }
    ],
    "isExpanded": true
  },
  "teamExecution": {
    "score": 85,
    "summary": "Experienced team with strong execution track record",
    "findings": [
      {
        "title": "Team Experience",
        "description": "Founders have relevant industry experience and successful track record",
        "impact": "positive",
        "severity": "major",
        "recommendations": [],
        "evidence": {
          "quote": "Previous exit to acquirer for $50M",
          "slideNumber": 10
        }
      }
    ],
    "isExpanded": true
  },
  "financialProjections": {
    "score": 65,
    "summary": "Financial projections are optimistic but lack detail",
    "findings": [
      {
        "title": "Projection Detail",
        "description": "Financial projections are high-level without supporting assumptions",
        "impact": "negative",
        "severity": "major",
        "recommendations": [
          "Add detailed financial model assumptions",
          "Include break-even analysis and key metrics"
        ],
        "evidence": {
          "slideNumber": 12
        }
      }
    ],
    "isExpanded": false
  },
  "competitiveLandscape": {
    "score": 70,
    "summary": "Good competitive positioning with clear differentiation",
    "findings": [
      {
        "title": "Competitive Analysis",
        "description": "Competitive analysis is present but could be more comprehensive",
        "impact": "neutral",
        "severity": "minor",
        "recommendations": [
          "Add more detailed competitive landscape mapping",
          "Include SWOT analysis for key competitors"
        ],
        "evidence": {
          "quote": "We are 2x faster than competitors",
          "slideNumber": 15
        }
      }
    ],
    "isExpanded": false
  },
  "createdAt": "2024-01-01T00:00:00.000Z",
  "completedAt": "2024-01-01T00:05:00.000Z"
}
```

### 4. Get Analysis Status

**GET** `/api/analysis/:uuid/status`

Returns the current status of an analysis job.

**Response:**
```json
{
  "uuid": "analysis-uuid",
  "status": "running",
  "progress": {
    "currentAgent": "market_opportunity",
    "completedAgents": ["overall_assessment", "business_model"],
    "totalAgents": 6,
    "percentComplete": 50
  },
  "startedAt": "2024-01-01T00:00:00.000Z",
  "estimatedCompletionAt": "2024-01-01T00:05:00.000Z"
}
```

## Status Values

| Status | Description |
|--------|-------------|
| `queued` | Analysis job is queued for processing |
| `running` | Analysis is in progress |
| `completed` | Analysis has completed successfully |
| `failed` | Analysis has failed |
| `cancelled` | Analysis was cancelled |

## Analysis Categories

The analysis engine evaluates six key categories:

### 1. Overall Assessment
Evaluates the overall quality and investment readiness of the pitch deck.

**Focus Areas:**
- Clarity of value proposition
- Overall narrative flow
- Professional presentation quality
- Investment potential assessment

### 2. Market Opportunity
Assesses the market size, growth potential, and target market validation.

**Focus Areas:**
- Total Addressable Market (TAM) size
- Market growth rate and trends
- Target market validation
- Market entry barriers

### 3. Business Model
Evaluates the viability and sustainability of the business model.

**Focus Areas:**
- Revenue streams and pricing strategy
- Business model scalability
- Unit economics and margins
- Competitive advantages

### 4. Team Execution
Analyzes the team's capability to execute the business plan.

**Focus Areas:**
- Team experience and expertise
- Industry knowledge
- Previous successes and failures
- Operational capabilities

### 5. Financial Projections
Validates the reasonableness and completeness of financial projections.

**Focus Areas:**
- Revenue projection assumptions
- Expense structure and burn rate
- Path to profitability
- Financial risk assessment

### 6. Competitive Landscape
Evaluates the competitive positioning and market differentiation.

**Focus Areas:**
- Competitive landscape mapping
- Key differentiators
- Market saturation
- Competitive advantages/disadvantages

## Finding Impact and Severity

### Impact Types
- **positive**: Strength, advantage, or opportunity
- **negative**: Weakness, risk, or threat
- **neutral**: Informational or neutral observation

### Severity Levels
- **critical**: Must address immediately, high impact on success
- **major**: Important to address, significant impact on success
- **minor**: Nice to address, minor impact on success

## Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Invalid request parameters",
  "error": "Bad Request"
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Analysis not found",
  "error": "Not Found"
}
```

### 500 Internal Server Error
```json
{
  "statusCode": 500,
  "message": "Internal server error",
  "error": "Internal Server Error"
}
```

## Rate Limiting

- **100 requests per minute** per authenticated user
- **10 concurrent analysis jobs** per user
- **Maximum 5 concurrent requests** per job

## Webhooks (Future Enhancement)

Future versions will support webhook notifications when analysis completes:

```json
{
  "event": "analysis.completed",
  "data": {
    "uuid": "analysis-uuid",
    "deckId": "deck-uuid",
    "overallScore": 75,
    "completedAt": "2024-01-01T00:05:00.000Z"
  }
}
```

## Example Usage

### cURL Example

```bash
# Create analysis
curl -X POST \
  http://localhost:8080/api/analysis \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "deckId": "deck-uuid",
    "analysisType": "full"
  }'

# Get UI results
curl -X GET \
  http://localhost:8080/api/analysis/uuid/ui \
  -H "Authorization: Bearer <jwt_token>"
```

### JavaScript Example

```javascript
// Create analysis
const response = await fetch('/api/analysis', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    deckId: 'deck-uuid',
    analysisType: 'full'
  })
});

const analysis = await response.json();

// Poll for completion
const pollStatus = async (uuid) => {
  const statusResponse = await fetch(`/api/analysis/${uuid}/status`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return statusResponse.json();
};

// Get UI results
const uiResponse = await fetch(`/api/analysis/${uuid}/ui`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const uiResults = await uiResponse.json();
```