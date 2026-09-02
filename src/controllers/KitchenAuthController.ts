import { NextResponse } from 'next/server';
import { UserModel } from '@/models/UserModel';
import { LoginLogModel } from '@/models/LoginLogModel';

const KITCHEN_PHONE = '+918888888888';
const KITCHEN_NAME = 'Central Dispatch Kitchen Staff';
const KITCHEN_VALID_PINS = ['8888', '1234', 'CRYO-CHEF-2026'];

export class KitchenAuthController {
  /**
   * POST /api/kitchen/auth/login
   * Authenticates Kitchen & Station staff with Staff PIN
   */
  static async login(req: Request) {
    try {
      const body = await req.json();
      const { phoneNumber, pin } = body;

      const enteredPin = (pin || '').trim();
      const isValid = KITCHEN_VALID_PINS.includes(enteredPin);

      if (!isValid) {
        await LoginLogModel.record({
          phoneNumber: phoneNumber || KITCHEN_PHONE,
          name: 'Unauthorized Kitchen Station Attempt',
          role: 'KITCHEN',
          status: 'FAILED',
          loginMethod: 'STAFF_PIN',
        });

        return NextResponse.json(
          { success: false, error: 'Invalid Kitchen Station Staff PIN' },
          { status: 401 }
        );
      }

      const user = await UserModel.upsertRoleUser(
        phoneNumber || KITCHEN_PHONE,
        KITCHEN_NAME,
        'KITCHEN',
        '8888'
      );

      await LoginLogModel.record({
        userId: user.id,
        phoneNumber: user.phoneNumber,
        name: user.name,
        role: 'KITCHEN',
        status: 'SUCCESS',
        loginMethod: 'STAFF_PIN',
      });

      const token = `ktc_${user.id}_${Date.now()}`;
      const response = NextResponse.json({
        success: true,
        message: 'Kitchen Station Clearance Granted',
        user: {
          id: user.id,
          name: user.name,
          phoneNumber: user.phoneNumber,
          role: 'KITCHEN',
        },
        token,
      });

      response.cookies.set('hemanth_auth_token', token, { path: '/', maxAge: 60 * 60 * 24 * 7 });
      response.cookies.set('hemanth_role', 'KITCHEN', { path: '/', maxAge: 60 * 60 * 24 * 7 });

      return response;
    } catch (err: any) {
      return NextResponse.json(
        { success: false, error: err.message || 'Kitchen authentication failed' },
        { status: 400 }
      );
    }
  }

  /**
   * POST /api/kitchen/auth/quick-login
   * One-Click Kitchen Staff Login
   */
  static async quickLogin() {
    try {
      const user = await UserModel.upsertRoleUser(KITCHEN_PHONE, KITCHEN_NAME, 'KITCHEN', '8888');

      await LoginLogModel.record({
        userId: user.id,
        phoneNumber: user.phoneNumber,
        name: user.name,
        role: 'KITCHEN',
        status: 'SUCCESS',
        loginMethod: 'KITCHEN_QUICK',
      });

      const token = `ktc_${user.id}_${Date.now()}`;
      const response = NextResponse.json({
        success: true,
        message: `Authenticated as ${user.name}`,
        user: {
          id: user.id,
          name: user.name,
          phoneNumber: user.phoneNumber,
          role: 'KITCHEN',
        },
        token,
      });

      response.cookies.set('hemanth_auth_token', token, { path: '/', maxAge: 60 * 60 * 24 * 7 });
      response.cookies.set('hemanth_role', 'KITCHEN', { path: '/', maxAge: 60 * 60 * 24 * 7 });

      return response;
    } catch (err: any) {
      return NextResponse.json(
        { success: false, error: err.message || 'Quick kitchen login failed' },
        { status: 400 }
      );
    }
  }
}
