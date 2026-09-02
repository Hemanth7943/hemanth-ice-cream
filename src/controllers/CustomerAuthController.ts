import { NextResponse } from 'next/server';
import { UserModel } from '@/models/UserModel';
import { LoginLogModel } from '@/models/LoginLogModel';
import { AuthSendOtpSchema, AuthVerifyOtpSchema } from '@/models/schemas';

const OTP_CACHE = new Map<string, { otp: string; expiresAt: number }>();

export class CustomerAuthController {
  /**
   * POST /api/customer/auth/send-otp
   */
  static async sendOtp(req: Request) {
    try {
      const body = await req.json();
      const validated = AuthSendOtpSchema.parse(body);

      const otp = '777888';
      const expiresAt = Date.now() + 5 * 60 * 1000;
      OTP_CACHE.set(validated.phoneNumber, { otp, expiresAt });

      return NextResponse.json({
        success: true,
        message: `VIP Concierge passcode dispatched to ${validated.phoneNumber}`,
        demoOtp: otp,
      });
    } catch (err: any) {
      return NextResponse.json(
        { success: false, error: err.message || 'Failed to dispatch passcode' },
        { status: 400 }
      );
    }
  }

  /**
   * POST /api/customer/auth/verify-otp
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
        // Record failed login attempt
        await LoginLogModel.record({
          phoneNumber: validated.phoneNumber,
          name: validated.name || 'Unverified Guest',
          role: 'CUSTOMER',
          status: 'FAILED',
          loginMethod: 'OTP',
        });

        return NextResponse.json(
          { success: false, error: 'Invalid or expired customer verification passcode' },
          { status: 401 }
        );
      }

      // Upsert Customer profile
      const user = await UserModel.upsertCustomer(
        validated.phoneNumber,
        validated.name || 'VIP Connoisseur'
      );

      // Record successful login audit log
      await LoginLogModel.record({
        userId: user.id,
        phoneNumber: user.phoneNumber,
        name: user.name,
        role: 'CUSTOMER',
        status: 'SUCCESS',
        loginMethod: 'OTP',
      });

      OTP_CACHE.delete(validated.phoneNumber);

      const token = `cust_${user.id}_${Date.now()}`;
      const response = NextResponse.json({
        success: true,
        message: `Welcome, ${user.name}`,
        user: {
          id: user.id,
          name: user.name,
          phoneNumber: user.phoneNumber,
          role: 'CUSTOMER',
        },
        token,
      });

      response.cookies.set('hemanth_auth_token', token, { path: '/', maxAge: 60 * 60 * 24 * 7 });
      response.cookies.set('hemanth_role', 'CUSTOMER', { path: '/', maxAge: 60 * 60 * 24 * 7 });

      return response;
    } catch (err: any) {
      return NextResponse.json(
        { success: false, error: err.message || 'Customer authentication failed' },
        { status: 400 }
      );
    }
  }

  /**
   * POST /api/customer/auth/vip-login
   * One-Click VIP access for Lord Hemanth
   */
  static async vipLogin(req: Request) {
    try {
      const phoneNumber = '+919876543210';
      const name = 'Lord Hemanth (VIP Connoisseur)';

      const user = await UserModel.upsertCustomer(phoneNumber, name);

      await LoginLogModel.record({
        userId: user.id,
        phoneNumber: user.phoneNumber,
        name: user.name,
        role: 'CUSTOMER',
        status: 'SUCCESS',
        loginMethod: 'VIP_ONE_CLICK',
      });

      const token = `cust_${user.id}_${Date.now()}`;
      const response = NextResponse.json({
        success: true,
        message: `Authenticated as ${user.name}`,
        user: {
          id: user.id,
          name: user.name,
          phoneNumber: user.phoneNumber,
          role: 'CUSTOMER',
        },
        token,
      });

      response.cookies.set('hemanth_auth_token', token, { path: '/', maxAge: 60 * 60 * 24 * 7 });
      response.cookies.set('hemanth_role', 'CUSTOMER', { path: '/', maxAge: 60 * 60 * 24 * 7 });

      return response;
    } catch (err: any) {
      return NextResponse.json(
        { success: false, error: err.message || 'VIP login failed' },
        { status: 400 }
      );
    }
  }
}
