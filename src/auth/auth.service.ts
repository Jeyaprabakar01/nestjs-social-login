import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterUserDto } from './dto/register-user.dto';
import * as bcrypt from 'bcryptjs';
import { LoginUserDto } from './dto/login-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private jwtService: JwtService,
  ) {}

  async registerUser(registerUserDto: RegisterUserDto) {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(registerUserDto.password, salt);

    const user = await this.prismaService.user.create({
      data: {
        fullName: registerUserDto.fullName,
        email: registerUserDto.email,
        password: hashedPassword,
      },
    });

    return user;
  }

  async loginUser(loginUserDto: LoginUserDto) {
    const user = await this.prismaService.user.findUnique({
      where: { email: loginUserDto.email },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const isPasswordMatched = await bcrypt.compare(
      loginUserDto.password,
      user.password,
    );

    if (!isPasswordMatched) {
      throw new UnauthorizedException('Incorrect password');
    }

    const tokenPayload = {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
    };

    const token = this.jwtService.sign(tokenPayload);

    return { token };
  }
}
