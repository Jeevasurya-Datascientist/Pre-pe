import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('wallet')
@UseGuards(JwtAuthGuard)
export class WalletController {
    constructor(private readonly walletService: WalletService) { }

    @Get()
    async getBalance(@Request() req: any) {
        return this.walletService.getBalance(req.user.id);
    }

    // Create Order
    @Post('create-order')
    async createOrder(@Request() req: any, @Body() body: { amount: number }) {
        return this.walletService.createOrder(req.user.id, body.amount);
    }

    // Verify Payment
    @Post('verify-payment')
    async verifyPayment(@Request() req: any, @Body() body: any) {
        return this.walletService.verifyAndCredit(req.user.id, {
            razorpay_order_id: body.razorpay_order_id,
            razorpay_payment_id: body.razorpay_payment_id,
            razorpay_signature: body.razorpay_signature,
            amount: body.amount
        });
    }

    // Admin only in real app, but exposed for demo
    @Post('credit')
    async credit(@Body() body: { userId: string, amount: number, ref?: string }) {
        return this.walletService.credit(body.userId, body.amount, body.ref);
    }
}
