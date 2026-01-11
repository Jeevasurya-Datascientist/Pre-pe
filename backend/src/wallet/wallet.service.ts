import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TransactionType } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class WalletService {
    constructor(private prisma: PrismaService) { }

    async getBalance(userId: string) {
        const wallet = await this.prisma.wallet.findUnique({
            where: { userId },
        });
        if (!wallet) throw new NotFoundException('Wallet not found');
        return wallet;
    }

    async credit(userId: string, amount: number, referenceId?: string) {
        return this.prisma.$transaction(async (tx) => {
            const wallet = await tx.wallet.findUnique({ where: { userId } });
            if (!wallet) throw new NotFoundException('Wallet not found');

            const newBalance = new Decimal(wallet.balance).plus(amount);

            // Optimistic locking check could go here if needed, but atomic update is safer
            const updatedWallet = await tx.wallet.update({
                where: { userId },
                data: {
                    balance: { increment: amount },
                    version: { increment: 1 },
                },
            });

            const transaction = await tx.walletTransaction.create({
                data: {
                    walletId: wallet.id,
                    amount: new Decimal(amount),
                    type: TransactionType.CREDIT,
                    referenceId,
                    balanceBefore: wallet.balance,
                    balanceAfter: updatedWallet.balance,
                },
            });

            return { wallet: updatedWallet, transaction };
        });
    }

    async debit(userId: string, amount: number, referenceId?: string) {
        return this.prisma.$transaction(async (tx) => {
            const wallet = await tx.wallet.findUnique({ where: { userId } });
            if (!wallet) throw new NotFoundException('Wallet not found');

            if (new Decimal(wallet.balance).lessThan(amount)) {
                throw new BadRequestException('Insufficient balance');
            }

            const updatedWallet = await tx.wallet.update({
                where: { userId },
                data: {
                    balance: { decrement: amount },
                    version: { increment: 1 },
                },
            });

            const transaction = await tx.walletTransaction.create({
                data: {
                    walletId: wallet.id,
                    amount: new Decimal(amount),
                    type: TransactionType.DEBIT,
                    referenceId,
                    balanceBefore: wallet.balance,
                    balanceAfter: updatedWallet.balance,
                },
            });

            return { wallet: updatedWallet, transaction };
        });
    }
}
