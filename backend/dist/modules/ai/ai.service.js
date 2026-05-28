"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const openai_1 = require("openai");
let AiService = class AiService {
    constructor(config) {
        this.config = config;
        this.openai = null;
        const key = config.get('openai.apiKey');
        if (key && key !== 'sk-...' && key.startsWith('sk-')) {
            this.openai = new openai_1.default({ apiKey: key });
        }
    }
    ensure() {
        if (!this.openai)
            throw new common_1.ServiceUnavailableException('OpenAI API key not configured');
    }
    async callOpenAI(messages) {
        try {
            const completion = await this.openai.chat.completions.create({
                model: 'gpt-4-turbo-preview',
                messages,
                response_format: { type: 'json_object' },
            });
            const content = completion.choices[0].message.content;
            if (!content)
                throw new Error('Empty response from OpenAI');
            return JSON.parse(content);
        }
        catch (err) {
            if (err instanceof common_1.ServiceUnavailableException)
                throw err;
            const msg = err?.message || 'OpenAI request failed';
            if (msg.includes('API key') || msg.includes('auth')) {
                throw new common_1.ServiceUnavailableException('OpenAI API key is invalid or expired');
            }
            throw new common_1.BadRequestException(msg);
        }
    }
    async generateEmail(prompt, tone = 'professional') {
        this.ensure();
        if (!prompt)
            throw new common_1.BadRequestException('prompt is required');
        return this.callOpenAI([
            {
                role: 'system',
                content: `You are an expert email marketer. Generate marketing emails with high open rates and conversions.
          Tone: ${tone}. Always respond with valid JSON only.`,
            },
            {
                role: 'user',
                content: `Generate a marketing email for: ${prompt}.
          Respond with JSON: { "subject": string, "previewText": string, "htmlContent": string, "textContent": string }`,
            },
        ]);
    }
    async generateSubjectLines(context, count = 5) {
        this.ensure();
        if (!context)
            throw new common_1.BadRequestException('context is required');
        return this.callOpenAI([
            {
                role: 'system',
                content: 'You are an email subject line expert. Generate high-converting subject lines. Always respond with JSON only.',
            },
            {
                role: 'user',
                content: `Generate ${count} email subject lines for: "${context}".
          Respond with JSON: { "subjects": [{ "text": string, "type": string, "estimatedOpenRate": number }] }`,
            },
        ]);
    }
    async analyzeCampaign(campaign) {
        this.ensure();
        if (!campaign.subject)
            throw new common_1.BadRequestException('subject is required');
        return this.callOpenAI([
            {
                role: 'system',
                content: 'You are an email deliverability and marketing expert. Analyze campaigns and provide actionable feedback. Respond with JSON only.',
            },
            {
                role: 'user',
                content: `Analyze this email campaign:
          Subject: "${campaign.subject}"
          HTML Content: ${campaign.htmlContent?.substring(0, 3000) || '(empty)'}
          Respond with JSON: {
            "score": number,
            "grade": string,
            "issues": [{ "type": string, "severity": "high"|"medium"|"low", "message": string, "fix": string }],
            "strengths": string[],
            "spamRisk": "low"|"medium"|"high",
            "estimatedOpenRate": number,
            "summary": string
          }`,
            },
        ]);
    }
    async optimizeSubject(subject) {
        this.ensure();
        if (!subject)
            throw new common_1.BadRequestException('subject is required');
        return this.callOpenAI([
            {
                role: 'user',
                content: `Analyze this email subject line: "${subject}"
          Respond with JSON: {
            "spamScore": number,
            "openRatePrediction": number,
            "issues": string[],
            "alternatives": [{ "text": string, "improvement": string }]
          }`,
            },
        ]);
    }
    async getBestSendTime(industry, audienceTimezone = 'UTC') {
        this.ensure();
        if (!industry)
            throw new common_1.BadRequestException('industry is required');
        return this.callOpenAI([
            {
                role: 'user',
                content: `What is the best time to send marketing emails for a ${industry} business to audience in ${audienceTimezone}?
          Respond with JSON: {
            "bestDay": string,
            "bestTime": string,
            "alternatives": [{ "day": string, "time": string, "reason": string }],
            "insights": string
          }`,
            },
        ]);
    }
};
exports.AiService = AiService;
exports.AiService = AiService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], AiService);
//# sourceMappingURL=ai.service.js.map