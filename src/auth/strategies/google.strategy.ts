/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-google-oauth20';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly prismaService: PrismaService,
  ) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL'),
      scope: ['profile', 'email'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: Profile) {
    const { displayName, emails } = profile;
    const fullName = displayName;
    const email = emails[0].value;

    const user = await this.prismaService.user.findUnique({ where: { email } });

    if (!user) {
      await this.prismaService.user.create({
        data: {
          fullName,
          email,
          password: '',
        },
      });
    }

    return { fullName, email };
  }
}
