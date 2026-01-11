import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { WalletModule } from './wallet/wallet.module';
import { RechargeModule } from './recharge/recharge.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
    imports: [PrismaModule, AuthModule, WalletModule, RechargeModule],
    controllers: [],
    providers: [],
})
export class AppModule { }
