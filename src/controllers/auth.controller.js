import { AuthService } from '../services/auth.service.js';

export class AuthController {
  static async signup(req, res, next) {
    const result = await AuthService.signup(req.body);
    res.status(201).json({ success: true, ...result });
  }

  static async signin(req, res, next) {
    const result = await AuthService.signin(req.body);
    res.status(200).json({ success: true, ...result });
  }

  static async refreshToken(req, res, next) {
    const { refreshToken } = req.body;
    const tokens = await AuthService.refresh(refreshToken);
    res.status(200).json({ success: true, tokens });
  }
}
