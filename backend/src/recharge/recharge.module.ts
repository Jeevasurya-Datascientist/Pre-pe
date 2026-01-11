import { Module } from '@nestjs/common';
import { RechargeService } from './recharge.service';
import { RechargeController } from './recharge.controller';
import { WalletModule } from '../wallet/wallet.module';

// Force IDE re-index

@Module({
    imports: [WalletModule],
    controllers: [RechargeController],
    providers: [RechargeService],
})
export class RechargeModule { }
