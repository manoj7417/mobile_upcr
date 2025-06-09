import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { db } from '../../db'
import { users } from '../../db/schema'
import { eq, sql } from 'drizzle-orm'
import jwt from 'jsonwebtoken'
import { getWebRequest, setCookie } from '@tanstack/react-start/server'
import bcrypt from 'bcryptjs'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'your-refresh-secret-key'

// Login schema
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

type LoginForm = z.infer<typeof loginSchema>

// Signup schema
const signupSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string()
    .min(8)
    .max(100)
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  resources: z.array(z.string()).min(1, 'Select at least one resource'),
  primaryResource: z.array(z.string()).min(1, 'Select a primary resource')
})

type SignupForm = z.infer<typeof signupSchema>

export const loginUser = createServerFn({
  method: 'POST',
  response: 'data',
})
  .validator((data: LoginForm) => {
    return loginSchema.parse(data)
  })
  .handler(async ({ data }) => {
    try {
      // Find user
      const user = await db.query.users.findFirst({
        where: eq(users.email, data.email),
      })

      if (!user) {
        return {
          success: false,
          error: 'Invalid credentials',
        }
      }

      // Verify password using bcrypt
      const isPasswordValid = await bcrypt.compare(data.password, user.password)
      if (!isPasswordValid) {
        return {
          success: false,
          error: 'Invalid credentials',
        }
      }

      if(!user.verified) {
        return {
          success: false,
          error: 'Account not verified',
        }
      }

      // Generate access token
      const accessToken = jwt.sign(
        { userId: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: '1d' }
      )

      // Generate refresh token
      const refreshToken = jwt.sign(
        { userId: user.id },
        REFRESH_TOKEN_SECRET,
        { expiresIn: '7d' } // Long-lived refresh token
      )

      // Set the access token cookie
      setCookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60, // 1 day
        path: '/',
      });

      // Set the refresh token cookie
      setCookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: '/',
      });

      return {
        success: true,
        user: {
          id: String(user.id),
          name: user.name,
          email: user.email,
        }
      }
    } catch (error) {
      console.error('Error in loginUser:', error);
      return {
        success: false,
        error: 'An unexpected error occurred',
      }
    }
  })

export const refreshToken = createServerFn({
  method: 'POST',
})
  .handler(async () => {
    try {
      const request = getWebRequest();
      const cookieHeader = request?.headers.get('cookie');
      
      if (!cookieHeader) {
        return {
          success: false,
          error: 'No cookies found',
        }
      }

      // Parse cookies
      const cookies = cookieHeader.split(';').reduce((acc: Record<string, string>, cookie: string) => {
        const [key, value] = cookie.trim().split('=');
        if (key && value) {
          acc[key] = decodeURIComponent(value);
        }
        return acc;
      }, {});

      const refreshToken = cookies['refreshToken'];
      if (!refreshToken) {
        return {
          success: false,
          error: 'No refresh token found',
        }
      }

      try {
        // Verify refresh token
        const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET) as { userId: number }

        // Find user
        const user = await db.query.users.findFirst({
          where: eq(users.id, decoded.userId),
        })

        if (!user) {
          return {
            success: false,
            error: 'User not found',
          }
        }

        // Generate new access token
        const newAccessToken = jwt.sign(
          { userId: user.id, email: user.email },
          JWT_SECRET,
          { expiresIn: '1d' }
        )

        // Set the new access token cookie
        setCookie('accessToken', newAccessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 24 * 60 * 60, // 1 day
          path: '/',
        });

        return {
          success: true,
          accessToken: newAccessToken,
          user: {
            id: String(user.id),
            name: user.name,
            email: user.email,
          }
        }
      } catch (error) {
        return {
          success: false,
          error: 'Invalid refresh token',
        }
      }
    } catch (error) {
      console.error('Token refresh error:', error)
      return {
        success: false,
        error: 'An unexpected error occurred',
      }
    }
  })

export const validateAccessToken = createServerFn({
  method: 'GET',
  response: 'data',
})
  .handler(async () => {
    try {
      const request = getWebRequest();
      if (!request) {
        console.error('No request context found');
        return {
          success: false,
          error: 'No request context found',
        }
      }

      const cookieHeader = request.headers.get('cookie');
      
      if (!cookieHeader) {
        console.error('No cookies found in request');
        return {
          success: false,
          error: 'No cookies found',
        }
      }

      // Parse cookies
      const cookies = cookieHeader.split(';').reduce((acc: Record<string, string>, cookie: string) => {
        const [key, value] = cookie.trim().split('=');
        if (key && value) {
          acc[key] = decodeURIComponent(value);
        }
        return acc;
      }, {});

      const accessToken = cookies['accessToken'];
      if (!accessToken) {
        console.error('No access token found in cookies');
        return {
          success: false,
          error: 'No access token found',
        }
      }

      try {
        // Verify access token
        const decoded = jwt.verify(accessToken, JWT_SECRET) as { userId: number, email: string }
        
        // Find user
        const user = await db.query.users.findFirst({
          where: eq(users.id, decoded.userId),
        })

        if (!user) {
          console.error('User not found for token');
          return {
            success: false,
            error: 'User not found',
          }
        }

        return {
          success: true,
          user: {
            id: String(user.id),
            name: user.name,
            email: user.email,
            verified: user.verified,
            profile_image_url: user.profile_image_url,
            resources: user.resources || [],
            primaryResource: user.primaryResource || [],
            is_admin: user.is_admin
          }
        }
      } catch (jwtError) {
        // If access token is expired, try to refresh it
        if (jwtError instanceof jwt.TokenExpiredError) {
          const refreshToken = cookies['refreshToken'];
          if (!refreshToken) {
            console.error('No refresh token found');
            return {
              success: false,
              error: 'Access token expired and no refresh token found',
            }
          }

          try {
            // Verify refresh token
            const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET) as { userId: number }
            
            // Find user
            const user = await db.query.users.findFirst({
              where: eq(users.id, decoded.userId),
            })

            if (!user) {
              console.error('User not found for refresh token');
              return {
                success: false,
                error: 'User not found',
              }
            }

            // Generate new access token
            const newAccessToken = jwt.sign(
              { userId: user.id, email: user.email },
              JWT_SECRET,
              { expiresIn: '1d' }
            )

            // Set the new access token cookie
            setCookie('accessToken', newAccessToken, {
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'strict',
              maxAge: 24 * 60 * 60, // 1 day
              path: '/',
            });

            return {
              success: true,
              user: {
                id: String(user.id),
                name: user.name,
                email: user.email,
                verified: user.verified,
                profile_image_url: user.profile_image_url,
                resources: user.resources || [],
                primaryResource: user.primaryResource || [],
                is_admin: user.is_admin
              }
            }
          } catch (refreshError) {
            console.error('Error refreshing token:', refreshError);
            return {
              success: false,
              error: 'Invalid refresh token',
            }
          }
        }

        console.error('Error validating access token:', jwtError);
        return {
          success: false,
          error: 'Invalid access token',
        }
      }
    } catch (error) {
      console.error('Error in validateAccessToken:', error);
      return {
        success: false,
        error: 'Internal server error',
      }
    }
  })

export const createUser = createServerFn({
  method: 'POST',
  response: 'data',
})
  .validator((data: SignupForm) => {
    return signupSchema.parse(data)
  })
  .handler(async ({ data }) => {
    try {
      // Check if user already exists
      const existingUser = await db.query.users.findFirst({
        where: eq(users.email, data.email),
      })

      if (existingUser) {
        return {
          success: false,
          error: 'Email already registered',
        }
      }

      // Count total users
      const totalUsers = await db.select({ count: sql`count(*)` }).from(users);
      const userCount = Number(totalUsers[0]?.count || 0);
      console.log(userCount)

      // Hash the password before storing
      const hashedPassword = await bcrypt.hash(data.password, 10)

      // Create new user
      const [newUser] = await db
        .insert(users)
        .values({
          name: data.name,
          email: data.email,
          password: hashedPassword,
          verified: userCount < 369,  // Set verified=true only for first 369 users
          resources: data.resources,
          primaryResource: data.primaryResource
        })
        .returning()

      if (!newUser) {
        return {
          success: false,
          error: 'Failed to create user',
        }
      }

      return {
        success: true,
        user: {
          id: String(newUser.id),
          name: newUser.name,
          email: newUser.email,
        },
      }
    } catch (error) {
      console.error('Error creating user:', error)
      return {
        success: false,
        error: 'Failed to create user',
      }
    }
  })

export const updateUserProfile = createServerFn({
  method: 'POST',
  response: 'data',
})
.validator((data: unknown) => {
  return z.object({
    name: z.string().min(1, 'Name is required'),
    profile_image_url: z.string().url().nullable().optional(),
    resources: z.array(z.string()).optional(),
    primaryResource: z.array(z.string()).optional(),
  }).parse(data);
})
.handler(async ({ data }): Promise<{ success: boolean; error?: string }> => {
  try {
    // Validate user token
    const authResult = await validateAccessToken();
    if (!authResult.success || !authResult.user) {
      return { success: false, error: 'Unauthorized' };
    }

    // Update user profile
    await db
      .update(users)
      .set({
        name: data.name,
        profile_image_url: data.profile_image_url,
        resources: data.resources || [],
        primaryResource: data.primaryResource || [],
        updated_at: new Date(),
      })
      .where(eq(users.id, parseInt(authResult.user.id, 10)));

    return { success: true };
  } catch (error) {
    console.error('Error updating user profile:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update profile' 
    };
  }
});

export const logoutUser = createServerFn({
  method: 'POST',
  response: 'data',
})
  .handler(async () => {
    try {
      // Clear access token cookie
      setCookie('accessToken', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 0, // Expire immediately
        path: '/',
      });

      // Clear refresh token cookie
      setCookie('refreshToken', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 0, // Expire immediately
        path: '/',
      });

      return {
        success: true
      }
    } catch (error) {
      console.error('Error in logoutUser:', error);
      return {
        success: false,
        error: 'An unexpected error occurred'
      }
    }
  }) 