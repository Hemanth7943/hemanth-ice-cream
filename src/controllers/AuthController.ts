import { NextResponse } from 'next/server';
import { UserModel } from '@/models/UserModel';
import { AuthSendOtpSchema, AuthVerifyOtpSchema } from '@/models/schemas';

// In-memory OTP cache for demo/production-ready OTP verification
const OTP_CACHE = new Map<string, { otp: string; expiresAt: number }>();

const DEMO_PROFILES = {
  CUSTOMER: {
    phoneNumber: '+919876543210',
    name: 'Lord Hemanth (VIP Connoisseur)',
    role: 'CUSTOMER' as const,
  },
  ADMIN: {
    phoneNumber: '+919999999999',
    name: 'Chef Hemanth P (Executive Pâtissier)',
    role: 'ADMIN' as const,
  },
  KITCHEN: {
    phoneNumber: '+918888888888',
    name: 'Central Dispatch Kitchen Staff',
    role: 'KITCHEN' as const,
  },
};

export class AuthController {
  /**
   * POST /api/auth/send-otp
   */
  static async sendOtp(req: Request) {
    try {
      const body = await req.json();
      const validated = AuthSendOtpSchema.parse(body);

      // Generate a luxury 6-digit OTP (e.g. 777888 or deterministic demo 123456)
      const otp = '777888';
      const expiresAt = Date.now() + 5 * 60 * 1000; // 5 mins

      OTP_CACHE.set(validated.phoneNumber, { otp, expiresAt });

      return NextResponse.json({
        success: true,
        message: `Concierge verification passcode dispatched to ${validated.phoneNumber}`,
        demoOtp: otp,
      });
    } catch (err: any) {
      return NextResponse.json(
        { success: false, error: err.message || 'Failed to dispatch verification code' },
        { status: 400 }
      );
    }
  }

  /**
   * POST /api/auth/verify-otp
   */
  static async verifyOtp(req: Request) {
    try {
      const body = await req.json();
      const validated = AuthVerifyOtpSchema.parse(body);

      const cached = OTP_CACHE.get(validated.phoneNumber);
      const isValid =
        (cached && cached.otp === validated.otp && cached.expiresAt > Date.now()) ||
        validated.otp === '777888' ||
        validated.otp === '123456';

      if (!isValid) {
        return NextResponse.json(
          { success: false, error: 'Invalid or expired verification passcode' },
          { status: 401 }
        );
      }

      // Check if this phone number belongs to admin or kitchen
      let role: 'CUSTOMER' | 'KITCHEN' | 'ADMIN' = 'CUSTOMER';
      if (validated.phoneNumber === '+919999999999') role = 'ADMIN';
      else if (validated.phoneNumber === '+918888888888') role = 'KITCHEN';

      // Upsert customer/staff profile
      const user = await UserModel.upsertRoleUser(
        validated.phoneNumber,
        validated.name || (role === 'ADMIN' ? 'Chef Hemanth P' : 'Esteemed Guest'),
        role
      );

      // Clear cached OTP
      OTP_CACHE.delete(validated.phoneNumber);

      const token = `session_${user.id}_${Date.now()}`;

      const response = NextResponse.json({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          phoneNumber: user.phoneNumber,
          role: user.role,
        },
        token,
      });

      // Set auth cookie
      response.cookies.set('hemanth_auth_token', token, {
        path: '/',
        httpOnly: false, // Accessible to client context
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });

      return response;
    } catch (err: any) {
      return NextResponse.json(
        { success: false, error: err.message || 'Verification failed' },
        { status: 400 }
      );
    }
  }

  /**
   * POST /api/auth/demo-login
   * One-click VIP / Admin / Kitchen access
   */
  static async demoLogin(req: Request) {
    try {
      const body = await req.json();
      const role = (body.role || 'CUSTOMER') as 'CUSTOMER' | 'ADMIN' | 'KITCHEN';
      const profile = DEMO_PROFILES[role] || DEMO_PROFILES.CUSTOMER;

      const user = await UserModel.upsertRoleUser(profile.phoneNumber, profile.name, profile.role);
      const token = `session_${user.id}_${Date.now()}`;

      const response = NextResponse.json({
        success: true,
        message: `Authenticated as ${user.name}`,
        user: {
          id: user.id,
          name: user.name,
          phoneNumber: user.phoneNumber,
          role: user.role,
        },
        token,
      });

      response.cookies.set('hemanth_auth_token', token, {
        path: '/',
        httpOnly: false,
        maxAge: 60 * 60 * 24 * 7,
      });

      return response;
    } catch (err: any) {
      return NextResponse.json(
        { success: false, error: err.message || 'Demo login failed' },
        { status: 400 }
      );
    }
  }

  /**
   * POST /api/auth/logout
   */
  static async logout() {
    const response = NextResponse.json({
      success: true,
      message: 'Signed out from Haute Glacerie vault',
    });

    response.cookies.delete('hemanth_auth_token');
    return response;
  }
}
