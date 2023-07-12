/* eslint-disable @typescript-eslint/no-empty-function */
import {
  Controller,
  Post,
  Body,
  Get,
  Res,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  @Post('/register')
  registerUser(@Body() registerUserDto: RegisterUserDto) {
    return this.authService.registerUser(registerUserDto);
  }

  @Post('/login')
  loginUser(@Body() loginUserDto: LoginUserDto) {
    return this.authService.loginUser(loginUserDto);
  }

  @Get('/google')
  googleLogin(@Res() res) {
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    const callbackUrl = this.configService.get<string>('GOOGLE_CALLBACK_URL');
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${callbackUrl}&response_type=code&scope=profile%20email`;
    res.redirect(googleAuthUrl);
  }

  @Get('/google/callback')
  async googleLoginRedirect(@Req() req) {
    if (!req.user) {
      throw new UnauthorizedException('User not authenticated');
    }
    const { fullName, email } = req.user;
    // Do something with the fullName and email (e.g., save to database, return as a response)
    return { fullName, email };
  }
}
