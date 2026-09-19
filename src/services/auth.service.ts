import crypto from 'crypto';

import { prisma } from '../lib/prisma';
import {
  hashPassword,
  verifyPassword,
} from '../lib/password';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../lib/tokens';
import { appEvents } from '../lib/events';
import { AUTH_EVENTS } from '../events/auth.events';
import { userRepository } from '../repositories/user.repository';

function normalizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

function hashRefreshToken(token: string): string {
  return crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
}

// ─────────────────────────────────────────────
// Register
// ─────────────────────────────────────────────

export async function register(data: {
  name: string;
  email: string;
  password: string;
}) {
  const email = normalizeEmail(data.email);

  const existing = await userRepository.findByEmail(email);

  if (existing) {
    throw new Error('Email already registered');
  }

  const passwordHash = await hashPassword(
    data.password,
  );

  const user = await userRepository.create({
      name: data.name,
      email,
      passwordHash,
  });

  appEvents.emit(
    AUTH_EVENTS.USER_REGISTERED,
    {
      id: user.id,
      email: user.email,
      tier: user.tier,
    },
  );

  return {
    id: user.id,
    email: user.email,
    tier: user.tier,
  };
}

// ─────────────────────────────────────────────
// Login
// ─────────────────────────────────────────────

export async function login(data: {
  email: string;
  password: string;
  deviceInfo?: string;
}) {
  const email = normalizeEmail(data.email);

  const user = await userRepository.findByEmail(email);

  if (!user || !user.isActive) {
    appEvents.emit(
      AUTH_EVENTS.LOGIN_FAILED,
      {
        email,
        deviceInfo: data.deviceInfo,
        reason: 'user_not_found',
      },
    );

    throw new Error('Invalid credentials');
  }

  const valid = await verifyPassword(
    data.password,
    user.passwordHash,
  );

  if (!valid) {
    appEvents.emit(
      AUTH_EVENTS.LOGIN_FAILED,
      {
        email,
        deviceInfo: data.deviceInfo,
        reason: 'wrong_password',
      },
    );

    throw new Error('Invalid credentials');
  }

  const accessToken = generateAccessToken(user);

  const refreshToken =
    generateRefreshToken(user);

  const tokenHash =
    hashRefreshToken(refreshToken);

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      token: tokenHash,
      expiresAt: new Date(
        Date.now() +
          7 * 24 * 60 * 60 * 1000,
      ),
    },
  });

  appEvents.emit(
    AUTH_EVENTS.USER_LOGGED_IN,
    {
      userId: user.id,
      deviceInfo: data.deviceInfo,
    },
  );

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      tier: user.tier,
    },
  };
}

// ─────────────────────────────────────────────
// Refresh
// ─────────────────────────────────────────────

export async function refresh(
  rawRefreshToken: string,
) {
  let payload;

  try {
    payload =
      verifyRefreshToken(rawRefreshToken);
  } catch {
    throw new Error(
      'Invalid refresh token',
    );
  }

  if (payload.type !== 'refresh') {
    throw new Error(
      'Invalid token type',
    );
  }

  const tokenHash =
    hashRefreshToken(rawRefreshToken);

  const stored =
    await prisma.refreshToken.findUnique({
      where: {
        token: tokenHash,
      },
    });

  if (
    !stored ||
    stored.expiresAt < new Date()
  ) {
    throw new Error(
      'Refresh token expired or revoked',
    );
  }

  const user = await prisma.user.findUnique({
    where: {
      id: payload.sub,
    },
  });

  if (!user || !user.isActive) {
    throw new Error(
      'User not found or inactive',
    );
  }

  // Rotate the refresh token.
  await prisma.refreshToken.delete({
    where: {
      token: tokenHash,
    },
  });

  const newAccessToken =
    generateAccessToken(user);

  const newRefreshToken =
    generateRefreshToken(user);

  const newHash =
    hashRefreshToken(newRefreshToken);

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      token: newHash,
      expiresAt: new Date(
        Date.now() +
          7 * 24 * 60 * 60 * 1000,
      ),
    },
  });

  appEvents.emit(
    AUTH_EVENTS.TOKEN_REFRESHED,
    {
      userId: user.id,
    },
  );

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
}

// ─────────────────────────────────────────────
// Logout
// ─────────────────────────────────────────────

export async function logout(
  rawRefreshToken: string,
) {
  const tokenHash =
    hashRefreshToken(rawRefreshToken);

  const result =
    await prisma.refreshToken.deleteMany({
      where: {
        token: tokenHash,
      },
    });

  appEvents.emit(
    AUTH_EVENTS.USER_LOGGED_OUT,
    {
      revoked: result.count > 0,
    },
  );
}