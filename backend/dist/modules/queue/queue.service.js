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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueueService = void 0;
const common_1 = require("@nestjs/common");
const bull_1 = require("@nestjs/bull");
let QueueService = class QueueService {
    constructor(emailQueue, csvQueue, analyticsQueue) {
        this.emailQueue = emailQueue;
        this.csvQueue = csvQueue;
        this.analyticsQueue = analyticsQueue;
    }
    async enqueueCampaign(campaignId, orgId) {
        return this.emailQueue.add('send-campaign', { campaignId, orgId }, {
            attempts: 3,
            backoff: { type: 'exponential', delay: 5000 },
        });
    }
    async enqueueSingleEmail(data) {
        return this.emailQueue.add('send-single', data, {
            attempts: 3,
            backoff: { type: 'exponential', delay: 2000 },
            removeOnComplete: 100,
            removeOnFail: 500,
        });
    }
    async enqueueCsvImport(data) {
        return this.csvQueue.add('import-csv', data, { attempts: 2 });
    }
    async trackEvent(data) {
        return this.analyticsQueue.add('track-event', data, {
            removeOnComplete: true,
            removeOnFail: 100,
        });
    }
    async getStats() {
        const [emailCounts, csvCounts] = await Promise.all([
            this.emailQueue.getJobCounts(),
            this.csvQueue.getJobCounts(),
        ]);
        return { emailQueue: emailCounts, csvQueue: csvCounts };
    }
};
exports.QueueService = QueueService;
exports.QueueService = QueueService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, bull_1.InjectQueue)('email-sending')),
    __param(1, (0, bull_1.InjectQueue)('csv-import')),
    __param(2, (0, bull_1.InjectQueue)('analytics')),
    __metadata("design:paramtypes", [Object, Object, Object])
], QueueService);
//# sourceMappingURL=queue.service.js.map