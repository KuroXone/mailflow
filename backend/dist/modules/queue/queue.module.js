"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueueModule = void 0;
const common_1 = require("@nestjs/common");
const bull_1 = require("@nestjs/bull");
const mail_service_1 = require("./mail.service");
const queue_service_1 = require("./queue.service");
const email_processor_1 = require("./processors/email.processor");
const csv_processor_1 = require("./processors/csv.processor");
const analytics_processor_1 = require("./processors/analytics.processor");
let QueueModule = class QueueModule {
};
exports.QueueModule = QueueModule;
exports.QueueModule = QueueModule = __decorate([
    (0, common_1.Module)({
        imports: [
            bull_1.BullModule.registerQueue({ name: 'email-sending' }, { name: 'csv-import' }, { name: 'analytics' }),
        ],
        providers: [mail_service_1.MailService, queue_service_1.QueueService, email_processor_1.EmailProcessor, csv_processor_1.CsvProcessor, analytics_processor_1.AnalyticsProcessor],
        exports: [mail_service_1.MailService, queue_service_1.QueueService, bull_1.BullModule],
    })
], QueueModule);
//# sourceMappingURL=queue.module.js.map