import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private prisma: PrismaService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET || 'secret',
        });
    }

    async validate(payload: any) {
        // Supabase JWT usually has 'sub' as the user_id
        const user = await this.prisma.profiles.findFirst({
            where: { user_id: payload.sub },
        });
        if (!user) {
            // We can return payload itself if profile doesn't exist yet, 
            // or throw Unauthorized depending on strictness. 
            // For now, let's allow it so basic auth works.
            return { id: payload.sub, email: payload.email };
        }
        return { ...user, id: user.user_id }; // Ensure 'id' is mapped for decorators
    }
}
