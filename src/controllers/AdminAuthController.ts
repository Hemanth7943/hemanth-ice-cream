import { NextResponse } from 'next/server';
import { UserModel } from '@/models/UserModel';
import { LoginLogModel } from '@/models/LoginLogModel';

const ADMIN_PHONE = '+919999999999';
const ADMIN_NAME = 'Chef Hemanth P (Executive Pâtissier)';
const ADMIN_VALID_PINS = ['9999', '1234', 'CHEF-HEMANTH-ADMIN-2026'];

export class AdminAuthController {
  /**
   * POST /api/admin/auth/login
   * Authenticates Master Admin with PIN or Master Secret Key
   */
  static async login(req: Request) {
    try {
      const body = await req.json();
      const { phoneNumber, pin, secretKey } = body;

      const enteredPin = (pin || secretKey || '').trim();
      const isValid = ADMIN_VALID_PINS.includes(enteredPin);

      if (!isValid) {
        await LoginLogModel.record({
          phoneNumber: phoneNumber || ADMIN_PHONE,
          name: 'Unauthorized Admin Attempt',
          role: 'ADMIN',
          status: 'FAILED',
          loginMethod: 'ADMIN_SECRET',
        });

        return NextResponse.json(
          { success: false, error: 'Invalid Master Admin Passcode or Secret Key' },
          { status: 401 }
        );
      }

      const user = await UserModel.upsertRoleUser(
        phoneNumber || ADMIN_PHONE,
        ADMIN_NAME,
        'ADMIN',
        '9999'
      );

      await LoginLogModel.record({
        userId: user.id,
        phoneNumber: user.phoneNumber,
        name: user.name,
        role: 'ADMIN',
        status: 'SUCCESS',
        loginMethod: 'ADMIN_SECRET',
      });

      const token = `adm_${user.id}_${Date.now()}`;
      const response = NextResponse.json({
        success: true,
        message: 'Master Admin Access Granted',
        user: {
          id: user.id,
          name: user.name,
          phoneNumber: user.phoneNumber,
          role: 'ADMIN',
        },
        token,
      });

      response.cookies.set('hemanth_auth_token', token, { path: '/', maxAge: 60 * 60 * 24 * 7 });
      response.cookies.set('hemanth_role', 'ADMIN', { path: '/', maxAge: 60 * 60 * 24 * 7 });

      return response;
    } catch (err: any) {
      return NextResponse.json(
        { success: false, error: err.message || 'Admin authentication failed' },
        { status: 400 }
      );
    }
  }

  /**
   * POST /api/admin/auth/quick-login
   * One-Click Master Admin Login
   */
  static async quickLogin() {
    try {
      const user = await UserModel.upsertRoleUser(ADMIN_PHONE, ADMIN_NAME, 'ADMIN', '9999');

      await LoginLogModel.record({
        userId: user.id,
        phoneNumber: user.phoneNumber,
        name: user.name,
        role: 'ADMIN',
        status: 'SUCCESS',
        loginMethod: 'ADMIN_QUICK',
      });

      const token = `adm_${user.id}_${Date.now()}`;
      const response = NextResponse.json({
        success: true,
        message: `Authenticated as ${user.name}`,
        user: {
          id: user.id,
          name: user.name,
          phoneNumber: user.phoneNumber,
          role: 'ADMIN',
        },
        token,
      });

      response.cookies.set('hemanth_auth_token', token, { path: '/', maxAge: 60 * 60 * 24 * 7 });
      response.cookies.set('hemanth_role', 'ADMIN', { path: '/', maxAge: 60 * 60 * 24 * 7 });

      return response;
    } catch (err: any) {
      return NextResponse.json(
        { success: false, error: err.message || 'Quick admin login failed' },
        { status: 400 }
      );
    }
  }
}
