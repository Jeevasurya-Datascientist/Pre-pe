import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WalletService } from '../wallet/wallet.service';
import { RechargeStatus } from '@prisma/client';

@Injectable()
export class RechargeService {
    constructor(
        private prisma: PrismaService,
        private walletService: WalletService,
    ) { }

    async initiateRecharge(userId: string, amount: number, mobileNumber: string, operator: string) {
        // 1. Check & Debit Balance (Atomic)
        // We use a reference ID for the debit to ensure idempotency if needed
        const referenceId = `RECHARGE_${Date.now()}_${mobileNumber}`;

        try {
            await this.walletService.debit(userId, amount, referenceId);
        } catch (e) {
            throw new BadRequestException('Insufficient balance or wallet error');
        }

        // 2. Create Recharge Transaction (PENDING)
        const transaction = await this.prisma.rechargeTransaction.create({
            data: {
                userId,
                amount,
                mobileNumber,
                operator,
                status: RechargeStatus.PENDING,
            },
        });

        // 3. Call Vendor API (Mock)
        this.mockVendorApiCall(transaction.id).then(async (success) => {
            const status = success ? RechargeStatus.SUCCESS : RechargeStatus.FAILED;

            await this.prisma.rechargeTransaction.update({
                where: { id: transaction.id },
                data: { status }
            });

            if (status === RechargeStatus.FAILED) {
                // Auto-refund
                await this.walletService.credit(userId, amount, `REFUND_${transaction.id}`);
            }
        });

        return transaction;
    }

    // Mimic an async 3rd party API call
    private async mockVendorApiCall(txId: string): Promise<boolean> {
        return new Promise(resolve => {
            setTimeout(() => {
                // Random success/failure
                resolve(Math.random() > 0.2);
            }, 2000);
        });
    }
}
