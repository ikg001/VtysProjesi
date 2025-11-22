import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { SignupDto, LoginDto, AuthResponseDto } from './dto/auth.dto';

const prisma = new PrismaClient();

/**
 * Authentication service
 * Handles user signup, login, and token generation
 *
 * Note: In a Supabase environment, this can be replaced with Supabase Auth SDK
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Register a new user
   */
  async signup(dto: SignupDto): Promise<AuthResponseDto> {
    // Check if user already exists
    // Note: This assumes a 'users' table exists. In Supabase, auth.users is managed separately.
    // For development, we'll store minimal user data in user_prefs table.

    const existing = await prisma.userPrefs.findUnique({
      where: { userId: dto.email }, // Temporary: using email as ID for demo
    });

    if (existing) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // In production with Supabase, you'd call:
    // const { data, error } = await supabase.auth.signUp({ email, password })

    // For now, create user preferences entry
    const userId = this.generateUserId(); // In reality, this comes from auth.users
    await prisma.userPrefs.create({
      data: {
        userId,
        tz: 'Europe/Istanbul',
        locale: 'tr-TR',
      },
    });

    // Generate tokens
    const tokens = await this.generateTokens(userId, dto.email);

    return {
      ...tokens,
      user: {
        id: userId,
        email: dto.email,
        fullName: dto.fullName,
      },
    };
  }

  /**
   * Authenticate user and return tokens
   */
  async login(dto: LoginDto): Promise<AuthResponseDto> {
    // In Supabase: supabase.auth.signInWithPassword({ email, password })

    // For development, we'll simulate authentication
    // In reality, you'd verify against auth.users table or Supabase

    // Mock user lookup
    const userId = '00000000-0000-0000-0000-000000000001'; // From seed

    // Verify password (in real app, fetch hashed password from DB)
    // const isValid = await bcrypt.compare(dto.password, user.hashedPassword);
    // if (!isValid) throw new UnauthorizedException('Invalid credentials');

    const tokens = await this.generateTokens(userId, dto.email);

    return {
      ...tokens,
      user: {
        id: userId,
        email: dto.email,
      },
    };
  }

  /**
   * Refresh access token using refresh token
   */
  async refresh(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      // Generate new access token
      const accessToken = await this.jwtService.signAsync(
        {
          sub: payload.sub,
          email: payload.email,
        },
        {
          secret: this.configService.get<string>('JWT_SECRET'),
          expiresIn: this.configService.get<string>('JWT_EXPIRES_IN'),
        },
      );

      return { accessToken };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  /**
   * Generate access and refresh tokens
   */
  private async generateTokens(userId: string, email: string) {
    const payload = { sub: userId, email };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: this.configService.get<string>('JWT_EXPIRES_IN'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN'),
      }),
    ]);

    return { accessToken, refreshToken };
  }

  /**
   * Generate a UUID for user (temporary helper)
   * In production, this comes from auth.users insert
   */
  private generateUserId(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
}
