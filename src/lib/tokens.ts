import jwt, {
  type SignOptions,
} from 'jsonwebtoken';
import { config } from './config';

const ACCESS_SECRET = config.JWT_ACCESS_SECRET;
const REFRESH_SECRET = config.JWT_REFRESH_SECRET;

if (!ACCESS_SECRET) {
  throw new Error('JWT_ACCESS_SECRET is not defined');
}

if (!REFRESH_SECRET) {
  throw new Error('JWT_REFRESH_SECRET is not defined');
}

interface TokenPayload {
  sub: string;
  role: string;
  type: 'access' | 'refresh';
}

export function generateAccessToken(user: {
  id: string;
  tier: string;
}): string {
  const payload: TokenPayload = {
    sub: user.id,
    role: user.tier,
    type: 'access',
  };

  const options: SignOptions = {
    expiresIn: '15m',
  };

  return jwt.sign(payload, ACCESS_SECRET, options);
}

export function generateRefreshToken(user: {
  id: string;
  tier: string;
}): string {
  const payload: TokenPayload = {
    sub: user.id,
    role: user.tier,
    type: 'refresh',
  };

  const options: SignOptions = {
    expiresIn: '7d',
  };

  return jwt.sign(payload, REFRESH_SECRET, options);
}

export function verifyAccessToken(
  token: string,
): TokenPayload {
  return jwt.verify(
    token,
    ACCESS_SECRET,
  ) as TokenPayload;
}

export function verifyRefreshToken(
  token: string,
): TokenPayload {
  return jwt.verify(
    token,
    REFRESH_SECRET,
  ) as TokenPayload;
}