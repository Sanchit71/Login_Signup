import { Body, Controller, Post, Get, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { get } from 'http';
import { AuthGuard } from 'src/guards/auth/auth.guard'

@Controller('auth')
export class AuthController {

    constructor(private readonly authService: AuthService) { }

    @Post('signup')
    async signup(@Body() signupDto: SignupDto) {
        return this.authService.signup(signupDto)
    }

    @Post('login')
    async login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto)
    }

    @UseGuards(AuthGuard)
    @Get('dashboard')
    async dashboard() {
        return this.authService.dashboard()
    }

    @UseGuards(AuthGuard)
    @Get('verify-token')
    async verifyToken() {
        return this.authService.verifyToken()
    }
}
