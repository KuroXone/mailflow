import { Controller, Get, Post, Body, Headers, Req, RawBodyRequest } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { BillingService } from './billing.service';
import { OrgId } from '../../common/decorators/org.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('billing')
@Controller('billing')
export class BillingController {
  constructor(private svc: BillingService) {}

  @ApiBearerAuth()
  @Get('subscription')
  getSubscription(@OrgId() orgId: string) {
    return this.svc.getSubscription(orgId);
  }

  @ApiBearerAuth()
  @Post('checkout')
  createCheckout(@OrgId() orgId: string, @CurrentUser() user: any, @Body() body: { plan: string; returnUrl: string }) {
    return this.svc.createCheckoutSession(orgId, user.id, body.plan, body.returnUrl);
  }

  @ApiBearerAuth()
  @Post('portal')
  createPortal(@OrgId() orgId: string, @Body() body: { returnUrl: string }) {
    return this.svc.createPortalSession(orgId, body.returnUrl);
  }

  @Public()
  @Post('webhook')
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    await this.svc.handleWebhook(req.rawBody as Buffer, signature);
    return { received: true };
  }

  @ApiBearerAuth()
  @Get('invoices')
  getInvoices(@OrgId() orgId: string) {
    return this.svc.getInvoices(orgId);
  }

  @ApiBearerAuth()
  @Get('usage')
  getUsage(@OrgId() orgId: string) {
    return this.svc.getUsage(orgId);
  }
}
