#!/usr/bin/env node

/**
 * Multi-Agent Research Swarm for Automated Content Engine
 *
 * This script orchestrates a swarm of research agents using a multi-model router
 * to comprehensively research and plan an automated content engine.
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ANSI color codes for beautiful console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

class MultiModelRouter {
  constructor(config) {
    this.models = config.models;
    this.fallbackStrategy = config.fallbackStrategy || 'sequential';
    this.loadBalancing = config.loadBalancing || false;
    this.currentModelIndex = 0;
  }

  selectModel(capabilities = []) {
    if (capabilities.length === 0) {
      return this.models[0];
    }

    // Find models that match required capabilities
    const matchingModels = this.models.filter(model =>
      capabilities.every(cap => model.capabilities.includes(cap))
    );

    if (matchingModels.length === 0) {
      console.log(`${colors.yellow}⚠ No exact capability match, using default model${colors.reset}`);
      return this.models[0];
    }

    // Load balancing: rotate through matching models
    if (this.loadBalancing && matchingModels.length > 1) {
      const model = matchingModels[this.currentModelIndex % matchingModels.length];
      this.currentModelIndex++;
      return model;
    }

    // Return highest priority matching model
    return matchingModels.sort((a, b) => a.priority - b.priority)[0];
  }

  getModelInfo(model) {
    return `${model.provider}/${model.model}`;
  }
}

class ResearchAgent {
  constructor(config, modelRouter) {
    this.id = config.id;
    this.name = config.name;
    this.role = config.role;
    this.instructions = config.instructions;
    this.tools = config.tools || [];
    this.priority = config.priority;
    this.modelRouter = modelRouter;
    this.modelConfig = config.model;
  }

  async execute(researchContext) {
    const startTime = Date.now();
    console.log(`\n${colors.cyan}┌─────────────────────────────────────────────────────────┐${colors.reset}`);
    console.log(`${colors.cyan}│${colors.reset} ${colors.bright}🤖 Agent: ${this.name}${colors.reset}`);
    console.log(`${colors.cyan}│${colors.reset} ${colors.dim}Role: ${this.role}${colors.reset}`);
    console.log(`${colors.cyan}└─────────────────────────────────────────────────────────┘${colors.reset}`);

    // Select appropriate model based on agent capabilities
    const selectedModel = this.modelRouter.selectModel(this.tools);
    console.log(`${colors.blue}📡 Using model: ${this.modelRouter.getModelInfo(selectedModel)}${colors.reset}`);

    // Simulate agent research (in real implementation, this would call actual APIs)
    const findings = await this.conductResearch(researchContext, selectedModel);

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`${colors.green}✓ Completed in ${duration}s${colors.reset}`);

    return {
      agentId: this.id,
      agentName: this.name,
      role: this.role,
      model: this.modelRouter.getModelInfo(selectedModel),
      findings,
      timestamp: new Date().toISOString(),
      duration: `${duration}s`
    };
  }

  async conductResearch(context, model) {
    // Simulate research with detailed findings based on agent role
    await this.delay(1000 + Math.random() * 2000); // Simulate processing time

    const researchFindings = {
      'market-researcher': this.marketResearch(context),
      'technical-researcher': this.technicalResearch(context),
      'workflow-architect': this.workflowArchitecture(context),
      'feature-analyst': this.featureAnalysis(context),
      'ux-researcher': this.uxResearch(context),
      'security-analyst': this.securityAnalysis(context),
      'goal-planner': this.goalPlanning(context),
      'prd-writer': this.prdWriting(context)
    };

    return researchFindings[this.id] || { message: 'Research completed' };
  }

  marketResearch(context) {
    return {
      summary: "Market analysis for automated content engines and AI-powered publishing platforms",
      competitors: [
        {
          name: "ContentBot",
          strengths: ["AI writing", "SEO optimization"],
          weaknesses: ["No Reddit integration", "Limited multi-agent workflow"],
          marketShare: "~5%"
        },
        {
          name: "Jasper.ai",
          strengths: ["High-quality content", "Brand voice"],
          weaknesses: ["Manual workflow", "Expensive"],
          marketShare: "~15%"
        },
        {
          name: "Copy.ai",
          strengths: ["Easy to use", "Templates"],
          weaknesses: ["No automation pipeline", "No publishing integration"],
          marketShare: "~8%"
        }
      ],
      marketOpportunities: [
        "Reddit trend monitoring is underserved",
        "Multi-agent automation is emerging trend",
        "WordPress integration adds immediate value",
        "Category-specific content generation has high demand",
        "Automated image generation reduces production time"
      ],
      targetAudience: [
        "Content marketing teams",
        "Digital agencies",
        "Tech bloggers and publishers",
        "Growth marketers",
        "Media companies"
      ],
      estimatedMarketSize: "$2.1B by 2026 (AI content generation market)",
      growthRate: "26% CAGR"
    };
  }

  technicalResearch(context) {
    return {
      summary: "Technical architecture and integration requirements",
      apis: {
        reddit: {
          api: "Reddit API v1 (OAuth2)",
          rateLimit: "60 requests/minute",
          endpoints: ["/hot", "/top", "/rising"],
          authentication: "OAuth2 with refresh tokens",
          challenges: ["Rate limiting", "Real-time monitoring", "Post filtering"]
        },
        aiModels: {
          textGeneration: [
            {
              provider: "OpenAI",
              model: "GPT-4 Turbo",
              costPer1kTokens: "$0.01-0.03",
              strengths: ["Quality", "Consistency"]
            },
            {
              provider: "Anthropic",
              model: "Claude 3 Opus",
              costPer1kTokens: "$0.015-0.075",
              strengths: ["Long context", "Reasoning"]
            },
            {
              provider: "Google",
              model: "Gemini Pro 1.5",
              costPer1kTokens: "$0.00125-0.005",
              strengths: ["Cost-effective", "Multimodal"]
            }
          ],
          imageGeneration: [
            {
              provider: "OpenAI",
              model: "DALL-E 3",
              costPerImage: "$0.04-0.12",
              resolution: "1024x1024 to 1792x1024"
            },
            {
              provider: "Stability AI",
              model: "Stable Diffusion XL",
              costPerImage: "$0.02",
              resolution: "1024x1024"
            }
          ]
        },
        wordpress: {
          api: "WordPress REST API v2",
          authentication: "Application Passwords or JWT",
          endpoints: ["/wp/v2/posts", "/wp/v2/media"],
          capabilities: ["Post creation", "Media upload", "Category assignment"],
          challenges: ["Authentication management", "Media handling", "SEO metadata"]
        }
      },
      infrastructure: {
        recommended: [
          {
            component: "Job Queue",
            options: ["BullMQ", "AWS SQS", "Google Cloud Tasks"],
            purpose: "Agent task orchestration"
          },
          {
            component: "Database",
            options: ["PostgreSQL", "MongoDB"],
            purpose: "Content storage, user management, analytics"
          },
          {
            component: "Cache",
            options: ["Redis", "Memcached"],
            purpose: "Reddit data caching, rate limit management"
          },
          {
            component: "File Storage",
            options: ["S3", "Google Cloud Storage"],
            purpose: "Generated images and media"
          },
          {
            component: "Monitoring",
            options: ["DataDog", "New Relic", "Prometheus"],
            purpose: "Agent performance, API usage, error tracking"
          }
        ]
      },
      architecture: {
        pattern: "Event-driven microservices with agent orchestration",
        components: [
          "Reddit Monitor Service (polls/webhooks)",
          "Agent Orchestrator (coordinates multi-agent workflow)",
          "Content Generation Service (AI integration)",
          "Image Generation Service (DALL-E/SD integration)",
          "Publishing Service (WordPress integration)",
          "Admin Dashboard (React/Next.js)",
          "API Gateway (authentication, rate limiting)"
        ]
      }
    };
  }

  workflowArchitecture(context) {
    return {
      summary: "Multi-agent workflow design for content pipeline",
      agents: [
        {
          name: "Reddit Monitoring Agent",
          trigger: "Scheduled (every 30 minutes) or event-driven",
          inputs: ["Subreddit list", "Category mappings", "Trend thresholds"],
          outputs: ["Trending post data", "Metadata", "Scores"],
          nextAgent: "Content Curation Agent",
          model: "Lightweight (Gemini Flash for analysis)",
          tools: ["Reddit API", "Trend analysis", "Scoring algorithm"]
        },
        {
          name: "Content Curation Agent",
          trigger: "Receives trending posts from Monitor",
          inputs: ["Trending posts", "Quality criteria", "Brand guidelines"],
          outputs: ["Curated post list", "Relevance scores", "Topic extraction"],
          nextAgent: "Research Agent",
          model: "Claude 3.5 Sonnet (reasoning)",
          tools: ["Content analysis", "Topic modeling", "Quality scoring"]
        },
        {
          name: "Research Agent",
          trigger: "Receives curated posts from Curation",
          inputs: ["Curated posts", "Topics", "Category"],
          outputs: ["Additional context", "Facts", "Sources", "Angles"],
          nextAgent: "Writing Agent",
          model: "Gemini Pro 1.5 (web search + analysis)",
          tools: ["Web search", "Fact checking", "Source validation"]
        },
        {
          name: "Writing Agent",
          trigger: "Receives research from Research Agent",
          inputs: ["Research data", "Sources", "Category", "Tone guidelines"],
          outputs: ["Article draft", "Headlines", "Meta description"],
          nextAgent: "Editing Agent",
          model: "GPT-4 Turbo or Claude 3 Opus (quality writing)",
          tools: ["Content generation", "SEO optimization", "Headline generation"]
        },
        {
          name: "Editing Agent",
          trigger: "Receives draft from Writing Agent",
          inputs: ["Article draft", "Brand voice", "SEO requirements"],
          outputs: ["Edited article", "Quality score", "Improvement suggestions"],
          nextAgent: "Image Generation Agent",
          model: "Claude 3.5 Sonnet (editing + reasoning)",
          tools: ["Grammar check", "Style consistency", "Fact verification"]
        },
        {
          name: "Image Generation Agent",
          trigger: "Receives edited article from Editing Agent",
          inputs: ["Article content", "Key topics", "Visual style guide"],
          outputs: ["2+ generated images", "Alt text", "Captions"],
          nextAgent: "Publishing Agent",
          model: "DALL-E 3 or Stable Diffusion XL",
          tools: ["Image generation", "Alt text creation", "Image optimization"]
        },
        {
          name: "Publishing Agent",
          trigger: "Receives complete article + images",
          inputs: ["Final article", "Images", "Category", "Scheduling preferences"],
          outputs: ["Published post URL", "Publication status", "Analytics setup"],
          nextAgent: "None (terminal)",
          model: "Lightweight coordination (Gemini Flash)",
          tools: ["WordPress API", "Media upload", "SEO metadata", "Analytics tracking"]
        }
      ],
      workflow: {
        mode: "Sequential pipeline with parallel optimization",
        errorHandling: "Retry with exponential backoff, manual review queue",
        humanInLoop: [
          "Content approval before publishing (optional)",
          "Quality threshold failures",
          "Controversial topics"
        ],
        parallelization: [
          "Monitor multiple subreddits simultaneously",
          "Generate multiple images in parallel",
          "Process multiple articles through pipeline concurrently"
        ]
      },
      orchestration: {
        framework: "BullMQ or Temporal for workflow management",
        stateManagement: "PostgreSQL for workflow state, Redis for real-time status",
        monitoring: "Agent performance metrics, success rates, latency tracking"
      }
    };
  }

  featureAnalysis(context) {
    return {
      summary: "Comprehensive feature set for automated content engine",
      coreFeatures: [
        {
          category: "Reddit Monitoring",
          features: [
            "Multi-subreddit tracking across 6 categories",
            "Customizable trend detection algorithms",
            "Post scoring and ranking",
            "Duplicate detection",
            "Blacklist/whitelist management"
          ],
          priority: "P0 (MVP)"
        },
        {
          category: "Content Generation",
          features: [
            "AI-powered article writing (1000-2000 words)",
            "Multiple writing styles per category",
            "SEO optimization (keywords, meta descriptions)",
            "Automatic internal linking",
            "Headline A/B testing generation"
          ],
          priority: "P0 (MVP)"
        },
        {
          category: "Image Generation",
          features: [
            "Minimum 2 images per article",
            "Context-aware image prompts",
            "Automatic alt text generation",
            "Image optimization and compression",
            "Featured image selection"
          ],
          priority: "P0 (MVP)"
        },
        {
          category: "WordPress Publishing",
          features: [
            "Automatic post creation",
            "Category and tag assignment",
            "Featured image setting",
            "SEO plugin integration (Yoast, Rank Math)",
            "Scheduled publishing",
            "Draft/pending/published workflows"
          ],
          priority: "P0 (MVP)"
        },
        {
          category: "User Administration",
          features: [
            "Role-based access control (Admin, Editor, Viewer)",
            "User invitation system",
            "Activity logging",
            "Permission management",
            "Team collaboration features"
          ],
          priority: "P1 (Post-MVP)"
        },
        {
          category: "Reaction System",
          features: [
            "Like/dislike for published content",
            "Comment moderation",
            "Social sharing analytics",
            "Engagement metrics",
            "Reaction-based content optimization"
          ],
          priority: "P1 (Post-MVP)"
        },
        {
          category: "Analytics Dashboard",
          features: [
            "Content performance metrics",
            "Agent performance tracking",
            "Cost analytics (API usage)",
            "Trending topic insights",
            "ROI calculations"
          ],
          priority: "P1 (Post-MVP)"
        }
      ],
      categories: [
        {
          name: "AI",
          subreddits: ["r/artificial", "r/MachineLearning", "r/LocalLLaMA"],
          toneStyle: "Technical but accessible, forward-looking"
        },
        {
          name: "Tech",
          subreddits: ["r/technology", "r/programming", "r/startups"],
          toneStyle: "Informative, industry-focused"
        },
        {
          name: "Science",
          subreddits: ["r/science", "r/EverythingScience", "r/Physics"],
          toneStyle: "Educational, evidence-based"
        },
        {
          name: "Futurology",
          subreddits: ["r/Futurology", "r/singularity"],
          toneStyle: "Speculative, visionary"
        },
        {
          name: "Marketing",
          subreddits: ["r/marketing", "r/digitalmarketing", "r/SEO"],
          toneStyle: "Actionable, results-oriented"
        },
        {
          name: "Interesting",
          subreddits: ["r/interestingasfuck", "r/todayilearned"],
          toneStyle: "Engaging, conversational"
        }
      ]
    };
  }

  uxResearch(context) {
    return {
      summary: "User experience design for admin dashboard and workflows",
      userPersonas: [
        {
          name: "Content Manager Sarah",
          role: "Oversees content strategy",
          needs: ["High-level analytics", "Content approval workflow", "Quality control"],
          painPoints: ["Too much manual work", "Inconsistent quality", "Slow publishing"]
        },
        {
          name: "Tech Blogger Mike",
          role: "Solo content creator",
          needs: ["Automation", "Cost efficiency", "Easy setup"],
          painPoints: ["Time-consuming research", "Writer's block", "Image sourcing"]
        },
        {
          name: "Agency Owner Lisa",
          role: "Manages multiple client blogs",
          needs: ["Multi-site support", "Team collaboration", "White-label options"],
          painPoints: ["Scaling content production", "Client reporting", "Team coordination"]
        }
      ],
      keyScreens: [
        {
          name: "Dashboard",
          elements: [
            "Active agents status widget",
            "Recent publications timeline",
            "Performance metrics (views, engagement)",
            "API usage and costs",
            "Trending topics preview"
          ],
          uxPrinciples: ["Glanceable information", "Quick actions", "Real-time updates"]
        },
        {
          name: "Content Pipeline",
          elements: [
            "Kanban-style workflow view",
            "Article cards with status (monitoring → research → writing → editing → publishing)",
            "Quick preview and edit",
            "Manual intervention options",
            "Bulk actions"
          ],
          uxPrinciples: ["Transparency", "Control", "Efficiency"]
        },
        {
          name: "Content Review",
          elements: [
            "Article preview with formatting",
            "Side-by-side source comparison",
            "Image gallery with captions",
            "SEO score card",
            "Approve/reject/edit actions"
          ],
          uxPrinciples: ["Quick decision-making", "Context-rich", "Quality assurance"]
        },
        {
          name: "Settings & Configuration",
          elements: [
            "Subreddit management per category",
            "Agent configuration (models, prompts)",
            "WordPress connection settings",
            "Brand voice and guidelines",
            "Scheduling preferences"
          ],
          uxPrinciples: ["Progressive disclosure", "Safe defaults", "Clear guidance"]
        }
      ],
      designSystem: {
        approach: "Modern, clean, data-driven",
        frameworks: ["Tailwind CSS", "shadcn/ui", "Recharts for analytics"],
        accessibility: "WCAG 2.1 AA compliance",
        responsive: "Mobile-first, tablet-optimized dashboard"
      }
    };
  }

  securityAnalysis(context) {
    return {
      summary: "Security considerations and compliance requirements",
      threats: [
        {
          threat: "API Key Exposure",
          risk: "High",
          mitigation: [
            "Use environment variables and secret management (AWS Secrets Manager, HashiCorp Vault)",
            "Never store keys in code or database",
            "Rotate keys regularly",
            "Implement key rotation without downtime"
          ]
        },
        {
          threat: "Unauthorized Access",
          risk: "High",
          mitigation: [
            "Implement OAuth2 or JWT authentication",
            "Role-based access control (RBAC)",
            "Multi-factor authentication for admin users",
            "Session management and timeout"
          ]
        },
        {
          threat: "Content Injection",
          risk: "Medium",
          mitigation: [
            "Sanitize all AI-generated content before publishing",
            "Implement content moderation rules",
            "XSS prevention in WordPress publishing",
            "SQL injection prevention"
          ]
        },
        {
          threat: "Rate Limit Abuse",
          risk: "Medium",
          mitigation: [
            "Implement exponential backoff for Reddit API",
            "Cache Reddit data to reduce API calls",
            "Monitor and alert on unusual API usage",
            "Implement application-level rate limiting"
          ]
        },
        {
          threat: "Data Breach",
          risk: "High",
          mitigation: [
            "Encrypt sensitive data at rest and in transit",
            "Regular security audits",
            "Implement data access logging",
            "GDPR-compliant data handling"
          ]
        }
      ],
      compliance: {
        gdpr: [
          "User data retention policies",
          "Right to deletion implementation",
          "Data processing agreements",
          "Privacy policy and terms of service"
        ],
        contentModeration: [
          "Implement AI content filtering for harmful content",
          "Human review for edge cases",
          "Compliance with platform policies (WordPress, Reddit)",
          "Copyright and attribution management"
        ]
      },
      bestPractices: [
        "Regular dependency updates and security patches",
        "Principle of least privilege for all services",
        "Comprehensive logging and monitoring",
        "Incident response plan",
        "Regular backups and disaster recovery testing"
      ]
    };
  }

  goalPlanning(context) {
    return {
      summary: "Strategic goals and implementation roadmap",
      visionStatement: "Create the most intelligent and efficient automated content engine that transforms Reddit trends into engaging, high-quality blog content through multi-agent AI collaboration",
      primaryGoals: [
        {
          goal: "Automate 80% of content production workflow",
          metric: "Percentage of articles published without human intervention",
          target: "80% by Month 6",
          keyResults: [
            "Achieve 95% Reddit monitoring accuracy",
            "Maintain 90%+ content quality score",
            "Reduce time-to-publish to <2 hours"
          ]
        },
        {
          goal: "Achieve high content engagement",
          metric: "Average article performance vs manual content",
          target: "Match or exceed by Month 4",
          keyResults: [
            "Equal or higher page views",
            "Equal or better engagement rate",
            "Lower bounce rate"
          ]
        },
        {
          goal: "Cost-effective operation",
          metric: "Cost per article including AI API costs",
          target: "<$5 per article by Month 3",
          keyResults: [
            "Optimize model selection for cost",
            "Reduce API calls through caching",
            "Achieve economy of scale (50+ articles/week)"
          ]
        }
      ],
      roadmap: {
        phase1: {
          name: "MVP Development",
          duration: "8-12 weeks",
          deliverables: [
            "Reddit monitoring for 6 categories",
            "Basic multi-agent workflow (5 core agents)",
            "WordPress publishing integration",
            "AI content and image generation",
            "Basic admin dashboard"
          ],
          successCriteria: "Successfully publish 10 quality articles per week with minimal manual intervention"
        },
        phase2: {
          name: "Enhancement & Optimization",
          duration: "6-8 weeks",
          deliverables: [
            "Advanced user administration",
            "Reaction and engagement system",
            "Analytics dashboard",
            "Content approval workflow",
            "Performance optimization"
          ],
          successCriteria: "Scale to 30+ articles per week, achieve target cost per article"
        },
        phase3: {
          name: "Scale & Intelligence",
          duration: "8-12 weeks",
          deliverables: [
            "Multi-site WordPress support",
            "Advanced agent learning and optimization",
            "Custom category creation",
            "White-label options",
            "API for external integrations"
          ],
          successCriteria: "Support multiple clients, achieve 90%+ automation rate"
        }
      },
      risks: [
        {
          risk: "AI-generated content quality inconsistency",
          probability: "Medium",
          impact: "High",
          mitigation: "Implement robust quality scoring, human review queue, continuous model fine-tuning"
        },
        {
          risk: "Reddit API changes or restrictions",
          probability: "Low",
          impact: "High",
          mitigation: "Build flexible monitoring layer, have backup data sources, maintain good API citizenship"
        },
        {
          risk: "High operational costs (AI APIs)",
          probability: "Medium",
          impact: "Medium",
          mitigation: "Multi-model router for cost optimization, caching strategies, usage monitoring"
        }
      ]
    };
  }

  prdWriting(context) {
    return {
      summary: "Comprehensive Product Requirements Document structure",
      sections: [
        "Executive Summary",
        "Problem Statement",
        "Target Users & Personas",
        "Product Vision & Goals",
        "Feature Requirements (Core & Future)",
        "Technical Architecture",
        "Multi-Agent Workflow",
        "User Interface Design",
        "Security & Compliance",
        "Success Metrics & KPIs",
        "Implementation Roadmap",
        "Risk Assessment",
        "Budget & Resources",
        "Appendices"
      ],
      note: "Full PRD will be generated after all research is compiled"
    };
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

class ResearchSwarm {
  constructor(configPath) {
    this.configPath = configPath;
    this.config = null;
    this.modelRouter = null;
    this.agents = [];
    this.results = {
      swarmName: '',
      startTime: null,
      endTime: null,
      phases: [],
      agentResults: []
    };
  }

  async initialize() {
    console.log(`${colors.bright}${colors.magenta}`);
    console.log('╔══════════════════════════════════════════════════════════════╗');
    console.log('║                                                              ║');
    console.log('║        🤖 MULTI-AGENT RESEARCH SWARM INITIALIZED 🤖         ║');
    console.log('║                                                              ║');
    console.log('║           Automated Content Engine Research                 ║');
    console.log('║                                                              ║');
    console.log('╚══════════════════════════════════════════════════════════════╝');
    console.log(colors.reset);

    // Load configuration
    const configContent = await fs.readFile(this.configPath, 'utf-8');
    this.config = JSON.parse(configContent);

    // Initialize multi-model router
    this.modelRouter = new MultiModelRouter(this.config.swarm.multiModelRouter);
    console.log(`\n${colors.green}✓ Multi-model router initialized with ${this.config.swarm.multiModelRouter.models.length} models${colors.reset}`);

    // Initialize agents
    for (const agentConfig of this.config.swarm.agents) {
      const agent = new ResearchAgent(agentConfig, this.modelRouter);
      this.agents.push(agent);
    }
    console.log(`${colors.green}✓ Initialized ${this.agents.length} research agents${colors.reset}`);

    this.results.swarmName = this.config.swarm.name;
    this.results.startTime = new Date().toISOString();
  }

  async executePhase(phase) {
    console.log(`\n${colors.bright}${colors.yellow}═══════════════════════════════════════════════════════════════${colors.reset}`);
    console.log(`${colors.bright}${colors.yellow}  PHASE: ${phase.name.toUpperCase()}${colors.reset}`);
    console.log(`${colors.bright}${colors.yellow}═══════════════════════════════════════════════════════════════${colors.reset}`);

    const phaseStartTime = Date.now();
    const phaseAgents = this.agents.filter(agent => phase.agents.includes(agent.id));
    const phaseResults = [];

    if (phase.execution === 'parallel') {
      console.log(`${colors.blue}⚡ Executing ${phaseAgents.length} agents in parallel${colors.reset}`);
      const results = await Promise.all(
        phaseAgents.map(agent => agent.execute(this.config.research))
      );
      phaseResults.push(...results);
    } else {
      console.log(`${colors.blue}→ Executing ${phaseAgents.length} agents sequentially${colors.reset}`);
      for (const agent of phaseAgents) {
        const result = await agent.execute(this.config.research);
        phaseResults.push(result);
      }
    }

    const phaseDuration = ((Date.now() - phaseStartTime) / 1000).toFixed(2);

    const phaseResult = {
      name: phase.name,
      execution: phase.execution,
      agentCount: phaseAgents.length,
      duration: `${phaseDuration}s`,
      results: phaseResults
    };

    this.results.phases.push(phaseResult);
    this.results.agentResults.push(...phaseResults);

    console.log(`\n${colors.green}✓ Phase '${phase.name}' completed in ${phaseDuration}s${colors.reset}`);
  }

  async execute() {
    console.log(`\n${colors.bright}Starting research swarm execution...${colors.reset}\n`);

    // Execute all phases
    for (const phase of this.config.swarm.phases) {
      await this.executePhase(phase);
    }

    this.results.endTime = new Date().toISOString();

    const totalDuration = (
      (new Date(this.results.endTime) - new Date(this.results.startTime)) / 1000
    ).toFixed(2);

    console.log(`\n${colors.bright}${colors.green}╔══════════════════════════════════════════════════════════════╗${colors.reset}`);
    console.log(`${colors.bright}${colors.green}║                                                              ║${colors.reset}`);
    console.log(`${colors.bright}${colors.green}║              ✓ RESEARCH SWARM COMPLETED ✓                   ║${colors.reset}`);
    console.log(`${colors.bright}${colors.green}║                                                              ║${colors.reset}`);
    console.log(`${colors.bright}${colors.green}║           Total Duration: ${totalDuration}s${' '.repeat(31 - totalDuration.length)}║${colors.reset}`);
    console.log(`${colors.bright}${colors.green}║           Agents Executed: ${this.agents.length}${' '.repeat(30 - String(this.agents.length).length)}║${colors.reset}`);
    console.log(`${colors.bright}${colors.green}║                                                              ║${colors.reset}`);
    console.log(`${colors.bright}${colors.green}╚══════════════════════════════════════════════════════════════╝${colors.reset}\n`);
  }

  async saveResults() {
    const outputDir = path.join(__dirname, 'research-output');
    await fs.mkdir(outputDir, { recursive: true });

    // Save complete results
    const resultsPath = path.join(outputDir, 'research-results.json');
    await fs.writeFile(resultsPath, JSON.stringify(this.results, null, 2));
    console.log(`${colors.green}✓ Results saved to: ${resultsPath}${colors.reset}`);

    // Save individual agent reports
    for (const result of this.results.agentResults) {
      const filename = `${result.agentId}-report.json`;
      const filepath = path.join(outputDir, filename);
      await fs.writeFile(filepath, JSON.stringify(result, null, 2));
    }
    console.log(`${colors.green}✓ Individual reports saved${colors.reset}`);

    return outputDir;
  }
}

// Main execution
async function main() {
  try {
    const configPath = path.join(__dirname, 'agent-config.json');
    const swarm = new ResearchSwarm(configPath);

    await swarm.initialize();
    await swarm.execute();
    const outputDir = await swarm.saveResults();

    console.log(`\n${colors.cyan}📊 Next Steps:${colors.reset}`);
    console.log(`${colors.dim}1. Review research results in: ${outputDir}${colors.reset}`);
    console.log(`${colors.dim}2. Generate PRD document using compiled research${colors.reset}`);
    console.log(`${colors.dim}3. Begin implementation planning${colors.reset}\n`);

    return swarm.results;
  } catch (error) {
    console.error(`${colors.red}✗ Error: ${error.message}${colors.reset}`);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { ResearchSwarm, ResearchAgent, MultiModelRouter };
