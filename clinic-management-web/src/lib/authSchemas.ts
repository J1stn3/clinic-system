import { z } from 'zod'

export const passwordSchema = z
  .string()
  .min(8, 'At least 8 characters')
  .regex(/[A-Z]/, 'Include an uppercase letter')
  .regex(/[a-z]/, 'Include a lowercase letter')
  .regex(/[0-9]/, 'Include a number')
  .regex(/[^a-zA-Z0-9]/, 'Include a special character')

export const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password is required'),
  acceptTerms: z.boolean().refine((v) => v, { message: 'You must accept the Terms and Conditions' }),
})

export const signUpSchema = z
  .object({
    fullName: z.string().min(2, 'Full name is required').max(128),
    email: z.string().email('Enter a valid email address'),
    password: passwordSchema,
    confirmPassword: z.string(),
    gender: z.string().min(1, 'Select your gender'),
    dateOfBirth: z.string().min(1, 'Date of birth is required'),
    acceptTerms: z.boolean().refine((v) => v, { message: 'You must accept the Terms and Conditions' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
  .refine((data) => {
    const dob = new Date(data.dateOfBirth)
    return !Number.isNaN(dob.getTime()) && dob < new Date()
  }, {
    message: 'Enter a valid date of birth',
    path: ['dateOfBirth'],
  })

export const forgotPasswordSchema = z.object({
  email: z.string().email('Enter a valid email address'),
})

export type LoginFormData = z.infer<typeof loginSchema>
export type SignUpFormData = z.infer<typeof signUpSchema>
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>
