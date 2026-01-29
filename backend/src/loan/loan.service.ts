import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WalletService } from '../wallet/wallet.service';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class LoanService {
    constructor(
        private prisma: PrismaService,
        private walletService: WalletService
    ) { }

    async requestLoan(userId: string, amount: number) {
        if (amount <= 0 || amount > 1000) {
            throw new BadRequestException('Loan amount must be between 1 and 1000');
        }

        // Check if user already has an active loan
        const activeLoan = await this.prisma.loans.findFirst({
            where: {
                user_id: userId,
                status: 'ACTIVE'
            }
        });

        if (activeLoan) {
            throw new BadRequestException('You already have an active loan. Please repay it first.');
        }

        // Calculate repayment date (15 days from now)
        const repaymentDate = new Date();
        repaymentDate.setDate(repaymentDate.getDate() + 15);

        // Constant bounce charges
        const bounceCharges = 50;

        return this.prisma.$transaction(async (tx) => {
            // Create loan record
            const loan = await tx.loans.create({
                data: {
                    user_id: userId,
                    amount: new Decimal(amount),
                    repayment_date: repaymentDate,
                    bounce_charges: new Decimal(bounceCharges),
                    status: 'ACTIVE',
                    nbfc_name: 'MicroFinance NBFC India',
                }
            });

            // Credit the wallet
            await this.walletService.credit(userId, amount, `Loan credited: ${loan.id}`);

            return loan;
        });
    }

    async getActiveLoans(userId: string) {
        return this.prisma.loans.findMany({
            where: {
                user_id: userId,
                status: 'ACTIVE'
            },
            orderBy: {
                created_at: 'desc'
            }
        });
    }

    async getLoanHistory(userId: string) {
        return this.prisma.loans.findMany({
            where: {
                user_id: userId
            },
            orderBy: {
                created_at: 'desc'
            }
        });
    }
}
