import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
    ) { }

    async validateUser(email: string, pass: string): Promise<any> {
        // Legacy auth logic removed. Use Supabase Auth.
        return null;
    }

    async login(user: any) {
        // This generates a custom JWT. Might still be useful if we pass a Supabase user.
        const payload = { email: user.email, sub: user.id || user.user_id, role: user.role };
        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id || user.user_id,
                email: user.email,
                phone: user.phone,
                fullName: user.email ? user.email.split('@')[0] : 'User',
                role: user.role,
            }
        };
    }

    async register(data: any) {
        // Legacy registration logic removed. Use Supabase Auth.
        throw new ConflictException('Register via Supabase Auth');
    }
}
