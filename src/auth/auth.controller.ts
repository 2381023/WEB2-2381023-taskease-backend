import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth') // Route prefix: /api/auth
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    // ValidationPipe handles DTO validation
    return this.authService.register(registerDto);
  }

  @HttpCode(HttpStatus.OK) // Return 200 OK on successful login
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    // ValidationPipe handles DTO validation
    return this.authService.login(loginDto);
  }
}
