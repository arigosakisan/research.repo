# Automated Content Engine - System Architecture

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     AUTOMATED CONTENT ENGINE                     │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────┐
│   Reddit API         │
│   - Trending Posts   │
│   - Hot/Top/Rising   │
│   - 6 Categories     │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────────────────────────────────────────────────┐
│                    MULTI-AGENT ORCHESTRATOR                       │
│                    (BullMQ / Temporal)                            │
└──────────────────────────────────────────────────────────────────┘
           │
           │  ┌─────────────────────────────────────────────┐
           │  │        MULTI-MODEL ROUTER                  │
           ├──┤  • Gemini 2.0 Flash (fast/cheap)          │
           │  │  • Claude 3.5 Sonnet (quality)            │
           │  │  • GPT-4 Turbo (writing)                  │
           │  │  • DALL-E 3 / SD XL (images)              │
           │  └─────────────────────────────────────────────┘
           │
           ▼
╔══════════════════════════════════════════════════════════════════╗
║                      AGENT PIPELINE                              ║
╚══════════════════════════════════════════════════════════════════╝

    ┌─────────────────────────────────────────────────────────┐
    │  1. REDDIT MONITORING AGENT                             │
    │     • Polls subreddits every 30 minutes                 │
    │     • Scores posts by engagement                        │
    │     • Filters by category                               │
    │     Model: Gemini Flash                                 │
    └────────────────────┬────────────────────────────────────┘
                         │
                         ▼
    ┌─────────────────────────────────────────────────────────┐
    │  2. CONTENT CURATION AGENT                              │
    │     • Filters quality posts                             │
    │     • Extracts topics                                   │
    │     • Checks for duplicates                             │
    │     Model: Claude 3.5 Sonnet                            │
    └────────────────────┬────────────────────────────────────┘
                         │
                         ▼
    ┌─────────────────────────────────────────────────────────┐
    │  3. RESEARCH AGENT                                      │
    │     • Web search for context                            │
    │     • Fact checking                                     │
    │     • Gather sources                                    │
    │     Model: Gemini Pro 1.5 + Search                      │
    └────────────────────┬────────────────────────────────────┘
                         │
                         ▼
    ┌─────────────────────────────────────────────────────────┐
    │  4. WRITING AGENT                                       │
    │     • Generate 1000-2000 word article                   │
    │     • SEO optimization                                  │
    │     • Multiple headline options                         │
    │     Model: GPT-4 Turbo / Claude 3 Opus                  │
    └────────────────────┬────────────────────────────────────┘
                         │
                         ▼
    ┌─────────────────────────────────────────────────────────┐
    │  5. EDITING AGENT                                       │
    │     • Grammar and style check                           │
    │     • Fact verification                                 │
    │     • Brand voice alignment                             │
    │     Model: Claude 3.5 Sonnet                            │
    └────────────────────┬────────────────────────────────────┘
                         │
                         ▼
    ┌─────────────────────────────────────────────────────────┐
    │  6. IMAGE GENERATION AGENT                              │
    │     • Generate 2+ contextual images                     │
    │     • Create alt text                                   │
    │     • Optimize for web                                  │
    │     Model: DALL-E 3 / Stable Diffusion XL               │
    └────────────────────┬────────────────────────────────────┘
                         │
                         ▼
    ┌─────────────────────────────────────────────────────────┐
    │  7. PUBLISHING AGENT                                    │
    │     • Upload to WordPress                               │
    │     • Set categories/tags                               │
    │     • Schedule/publish                                  │
    │     Model: Gemini Flash (coordination)                  │
    └────────────────────┬────────────────────────────────────┘
                         │
                         ▼
           ┌─────────────────────────┐
           │   WordPress Site        │
           │   - Published Articles  │
           │   - SEO Optimized       │
           │   - With Images         │
           └─────────────────────────┘
```

## Data Flow Architecture

```
┌──────────────┐
│ PostgreSQL   │     ┌──────────────┐
│ - Content    │◄────┤   Redis      │
│ - Users      │     │ - Cache      │
│ - Analytics  │────►│ - Queue      │
└──────────────┘     │ - Sessions   │
                     └──────────────┘
        │                    │
        │                    │
        ▼                    ▼
┌─────────────────────────────────────┐
│     API Gateway / Load Balancer     │
└─────────────────────────────────────┘
        │                    │
        ▼                    ▼
┌──────────────┐    ┌──────────────────┐
│ Admin UI     │    │ Agent Services   │
│ (Next.js)    │    │ (Node.js)        │
│ - Dashboard  │    │ - Orchestration  │
│ - Content    │    │ - AI Integration │
│ - Analytics  │    │ - Publishing     │
└──────────────┘    └──────────────────┘
```

## Component Breakdown

### 1. Reddit Monitoring Service

**Technology**: Node.js service with cron scheduler
**Responsibilities**:
- Poll Reddit API every 30 minutes
- Score posts using engagement algorithm
- Cache trending posts in Redis
- Trigger content curation for qualified posts

**API Integration**:
```
GET /r/{subreddit}/hot
GET /r/{subreddit}/top?t=day
GET /r/{subreddit}/rising
```

**Rate Limiting**: 60 requests/minute (managed with Redis)

### 2. Agent Orchestrator

**Technology**: BullMQ + Redis or Temporal
**Responsibilities**:
- Queue management for agent tasks
- Workflow state management
- Error handling and retries
- Parallel agent execution
- Performance monitoring

**Key Features**:
- Exponential backoff for failures
- Dead letter queue for manual review
- Real-time status updates
- Cost tracking per workflow

### 3. Multi-Model Router

**Technology**: Custom TypeScript service
**Responsibilities**:
- Dynamic model selection based on task
- Load balancing across providers
- Cost optimization
- Automatic failover
- Usage analytics

**Selection Criteria**:
```typescript
interface TaskRequirements {
  capability: 'research' | 'writing' | 'editing' | 'images';
  priority: 'speed' | 'quality' | 'cost';
  maxTokens: number;
  budget: number;
}
```

### 4. Content Generation Service

**Technology**: Node.js + AI SDKs (OpenAI, Anthropic, Google)
**Responsibilities**:
- Manage AI API integrations
- Prompt engineering and optimization
- Response parsing and validation
- Token usage tracking

**AI Provider Integration**:
```javascript
// OpenAI
import OpenAI from 'openai';

// Anthropic
import Anthropic from '@anthropic-ai/sdk';

// Google
import { GoogleGenerativeAI } from '@google/generative-ai';
```

### 5. Image Generation Service

**Technology**: DALL-E 3 / Stable Diffusion XL APIs
**Responsibilities**:
- Generate contextual images from article content
- Automatic prompt engineering
- Image optimization and compression
- Alt text generation
- Storage management (S3/GCS)

**Image Pipeline**:
```
Article Content → Extract Key Concepts → Generate Prompts
→ Call Image API (2+ images) → Optimize (WebP) → Upload to Storage
→ Return URLs + Alt Text
```

### 6. WordPress Publishing Service

**Technology**: WordPress REST API v2
**Responsibilities**:
- Authentication management
- Post creation with metadata
- Media upload
- Category and tag assignment
- SEO plugin integration (Yoast/Rank Math)
- Scheduled publishing

**WordPress API Flow**:
```
1. POST /wp/v2/media (upload images)
2. POST /wp/v2/posts (create post)
3. POST /wp/v2/posts/{id} (set featured image)
4. POST /wp/v2/posts/{id} (add categories/tags)
5. POST /wp/v2/posts/{id} (publish or schedule)
```

### 7. Admin Dashboard

**Technology**: Next.js 14 + React 18
**Responsibilities**:
- User authentication and authorization
- Content pipeline visualization
- Article review and approval
- Analytics and reporting
- System configuration
- User management

**Key Features**:
- Real-time agent status monitoring
- Content preview with inline editing
- Kanban-style workflow view
- Performance metrics and charts
- Cost tracking dashboard

## Database Schema

### Core Tables

```sql
-- Content tracking
CREATE TABLE articles (
  id UUID PRIMARY KEY,
  reddit_post_id VARCHAR(50),
  reddit_url TEXT,
  category VARCHAR(50),
  status VARCHAR(20), -- monitoring, researching, writing, editing, publishing, published
  title TEXT,
  content TEXT,
  seo_meta JSONB,
  images JSONB,
  wordpress_post_id INTEGER,
  wordpress_url TEXT,
  quality_score DECIMAL(3,2),
  cost_breakdown JSONB,
  created_at TIMESTAMP,
  published_at TIMESTAMP
);

-- Agent execution tracking
CREATE TABLE agent_executions (
  id UUID PRIMARY KEY,
  article_id UUID REFERENCES articles(id),
  agent_name VARCHAR(100),
  model_used VARCHAR(100),
  status VARCHAR(20), -- pending, running, completed, failed
  input_data JSONB,
  output_data JSONB,
  tokens_used INTEGER,
  cost DECIMAL(10,4),
  duration_ms INTEGER,
  error_message TEXT,
  started_at TIMESTAMP,
  completed_at TIMESTAMP
);

-- User management
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  name VARCHAR(255),
  role VARCHAR(50), -- admin, editor, viewer
  permissions JSONB,
  created_at TIMESTAMP,
  last_login TIMESTAMP
);

-- Analytics
CREATE TABLE article_analytics (
  id UUID PRIMARY KEY,
  article_id UUID REFERENCES articles(id),
  views INTEGER DEFAULT 0,
  avg_time_on_page INTEGER,
  bounce_rate DECIMAL(5,2),
  social_shares INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  date DATE,
  UNIQUE(article_id, date)
);

-- Reddit monitoring
CREATE TABLE reddit_posts (
  id VARCHAR(50) PRIMARY KEY,
  subreddit VARCHAR(100),
  category VARCHAR(50),
  title TEXT,
  url TEXT,
  score INTEGER,
  num_comments INTEGER,
  created_utc TIMESTAMP,
  processed BOOLEAN DEFAULT FALSE,
  processed_at TIMESTAMP
);
```

## Security Architecture

### Authentication & Authorization

```
┌────────────────┐
│   Client       │
└───────┬────────┘
        │
        │ JWT Token
        ▼
┌────────────────────────────────┐
│   API Gateway                  │
│   - Token validation           │
│   - Rate limiting              │
│   - CORS                       │
└───────┬────────────────────────┘
        │
        ▼
┌────────────────────────────────┐
│   RBAC Middleware              │
│   - Role: admin, editor, view  │
│   - Permission checks          │
└───────┬────────────────────────┘
        │
        ▼
┌────────────────────────────────┐
│   Application Services         │
└────────────────────────────────┘
```

### Secrets Management

```
Environment Variables (.env) → Never committed
         │
         ▼
AWS Secrets Manager / HashiCorp Vault
         │
         ▼
Application Runtime (injected at startup)
```

### API Key Protection

- Store in secret management system
- Rotate keys every 90 days
- Monitor usage for anomalies
- Implement request signing
- Use API key per environment

## Deployment Architecture

### Production Environment

```
┌──────────────────────────────────────────────────────┐
│                   Load Balancer                      │
│                   (AWS ALB / GCP LB)                 │
└────────────────────┬─────────────────────────────────┘
                     │
         ┌───────────┴───────────┐
         │                       │
         ▼                       ▼
┌─────────────────┐     ┌─────────────────┐
│  Web Servers    │     │  API Servers    │
│  (Next.js)      │     │  (Node.js)      │
│  Auto-scaling   │     │  Auto-scaling   │
│  2-10 instances │     │  3-15 instances │
└─────────────────┘     └────────┬────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │   Agent Workers         │
                    │   (Node.js)             │
                    │   Auto-scaling          │
                    │   5-50 instances        │
                    └────────┬────────────────┘
                             │
         ┌───────────────────┼───────────────────┐
         │                   │                   │
         ▼                   ▼                   ▼
┌─────────────────┐ ┌──────────────┐ ┌──────────────────┐
│  PostgreSQL     │ │   Redis      │ │  Object Storage  │
│  (RDS/Cloud SQL)│ │  (ElastiCache│ │  (S3/GCS)        │
│  Multi-AZ       │ │   / Memstore)│ │  Images/Media    │
└─────────────────┘ └──────────────┘ └──────────────────┘
```

### Monitoring & Observability

```
┌───────────────────────────────────────────────────┐
│             Monitoring Stack                      │
├───────────────────────────────────────────────────┤
│  Application Metrics → DataDog / New Relic       │
│  Logs → CloudWatch / Stackdriver                 │
│  APM → DataDog APM / New Relic APM               │
│  Errors → Sentry                                 │
│  Uptime → Pingdom / UptimeRobot                  │
└───────────────────────────────────────────────────┘
```

### CI/CD Pipeline

```
GitHub Push → GitHub Actions
    │
    ├─ Run Tests (Jest + Playwright)
    ├─ Lint & Type Check
    ├─ Build Docker Images
    │
    ▼
Deploy to Staging
    │
    ├─ Integration Tests
    ├─ Performance Tests
    │
    ▼
Manual Approval Gate
    │
    ▼
Deploy to Production
    │
    ├─ Blue-Green Deployment
    ├─ Health Checks
    ├─ Automated Rollback if Needed
    │
    ▼
Success → Monitor
```

## Performance Optimization

### Caching Strategy

1. **Reddit Data**: Cache trending posts for 30 minutes
2. **AI Responses**: Cache similar prompts for 24 hours
3. **WordPress Content**: Cache published posts for 1 hour
4. **User Sessions**: Redis with 7-day TTL
5. **Static Assets**: CDN with 1-year TTL

### Scalability Considerations

- **Horizontal scaling**: Auto-scale agent workers based on queue depth
- **Database read replicas**: Separate read/write operations
- **Queue partitioning**: Separate queues per category for parallel processing
- **Rate limit management**: Distributed rate limiting with Redis
- **Cost optimization**: Scale down during low-traffic periods

## Cost Estimates

### Monthly Operating Costs (50 articles/week)

**Infrastructure**:
- Compute (ECS/GKE): $200-400
- Database (RDS/Cloud SQL): $100-200
- Cache (ElastiCache/Memorystore): $50-100
- Storage (S3/GCS): $20-50
- Monitoring: $100-200
**Subtotal**: $470-950

**AI APIs** (per article × 200 articles/month):
- Content generation: $1.50-3.00
- Image generation: $0.80-1.20
- Research/analysis: $0.20-0.50
**Per article**: $2.50-4.70
**Subtotal**: $500-940

**Total Monthly**: $970-1,890

---

## Next Steps

1. Set up infrastructure (Terraform/CloudFormation)
2. Implement agent orchestrator
3. Build multi-model router
4. Integrate AI APIs
5. Develop agent pipeline
6. Create admin dashboard
7. Deploy to staging
8. Performance testing
9. Production launch

**Architecture Ready**: ✅
**PRD Aligned**: ✅
**Scalable**: ✅
**Cost-Optimized**: ✅
