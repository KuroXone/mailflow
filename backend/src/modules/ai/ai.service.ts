import { Injectable, ServiceUnavailableException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class AiService {
  private openai: OpenAI | null = null;

  constructor(private config: ConfigService) {
    const key = config.get<string>('openai.apiKey');
    if (key && key !== 'sk-...' && key.startsWith('sk-')) {
      this.openai = new OpenAI({ apiKey: key });
    }
  }

  private ensure() {
    if (!this.openai) throw new ServiceUnavailableException('OpenAI API key not configured');
  }

  private async callOpenAI(messages: OpenAI.Chat.ChatCompletionMessageParam[]) {
    try {
      const completion = await this.openai!.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages,
        response_format: { type: 'json_object' },
      });
      const content = completion.choices[0].message.content;
      if (!content) throw new Error('Empty response from OpenAI');
      return JSON.parse(content);
    } catch (err: any) {
      if (err instanceof ServiceUnavailableException) throw err;
      const msg = err?.message || 'OpenAI request failed';
      if (msg.includes('API key') || msg.includes('auth')) {
        throw new ServiceUnavailableException('OpenAI API key is invalid or expired');
      }
      throw new BadRequestException(msg);
    }
  }

  async generateEmail(prompt: string, tone: string = 'professional') {
    this.ensure();
    if (!prompt) throw new BadRequestException('prompt is required');
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

  async generateSubjectLines(context: string, count: number = 5) {
    this.ensure();
    if (!context) throw new BadRequestException('context is required');
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

  async analyzeCampaign(campaign: { subject: string; htmlContent: string; listSize?: number }) {
    this.ensure();
    if (!campaign.subject) throw new BadRequestException('subject is required');
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

  async optimizeSubject(subject: string) {
    this.ensure();
    if (!subject) throw new BadRequestException('subject is required');
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

  async getBestSendTime(industry: string, audienceTimezone: string = 'UTC') {
    this.ensure();
    if (!industry) throw new BadRequestException('industry is required');
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
}
