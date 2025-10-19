/**
 * Email Service Integration with Resend
 * @rule 060 "API standards for external service integration"
 * @rule 130 "Error handling for email operations"
 * @rule 011 "Environment variable security for API keys"
 */

import { Resend } from 'resend';

// Only initialize Resend in production with valid API key
const resend = process.env.RESEND_API_KEY && process.env.NODE_ENV === 'production' 
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

/**
 * Sends OTP verification email to participant
 */
export async function sendOTPEmail(email: string, otpCode: string): Promise<boolean> {
  try {
    console.log('📧 Sending OTP email to:', email.replace(/(.{2}).*(@.*)/, '$1***$2'));

    // In development, just log the email instead of sending
    if (!resend) {
      console.log('🔧 Development mode - Email would be sent with OTP:', otpCode);
      return true;
    }

    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'noreply@localhost',
      to: [email],
      subject: 'AI Education Survey - Access Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">AI Education Survey</h1>
            <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Access Code Request</p>
          </div>
          
          <div style="padding: 30px; background: white;">
            <h2 style="color: #1f2937; margin-top: 0;">Your Access Code</h2>
            <p style="color: #4b5563; line-height: 1.6;">
              Thank you for participating in our AI in Education survey. Use the code below to access your survey:
            </p>
            
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
              <div style="font-size: 32px; font-weight: bold; color: #6366f1; letter-spacing: 4px; font-family: monospace;">
                ${otpCode}
              </div>
              <p style="color: #6b7280; margin: 10px 0 0 0; font-size: 14px;">
                This code expires in 10 minutes
              </p>
            </div>
            
            <p style="color: #4b5563; line-height: 1.6;">
              If you didn't request this code, you can safely ignore this email.
            </p>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            
            <p style="color: #9ca3af; font-size: 12px; text-align: center;">
              This survey is part of the "No Concept Left Behind" research initiative.<br>
              Your responses will be kept anonymous and used for educational research purposes only.
            </p>
          </div>
        </div>
      `,
      text: `
AI Education Survey - Access Code

Your access code: ${otpCode}

This code expires in 10 minutes. Use it to access your survey.

If you didn't request this code, you can safely ignore this email.

This survey is part of the "No Concept Left Behind" research initiative.
      `,
    });

    if (error) {
      console.error('❌ Email sending failed:', error);
      return false;
    }

    console.log('✅ OTP email sent successfully:', data?.id);
    return true;

  } catch (error) {
    console.error('❌ Email service error:', error);
    return false;
  }
}

/**
 * Sends invitation email to participant
 */
export async function sendInvitationEmail(email: string, group: string): Promise<boolean> {
  try {
    console.log('📨 Sending invitation email to:', email.replace(/(.{2}).*(@.*)/, '$1***$2'));

    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'noreply@localhost',
      to: [email],
      subject: 'Invitation: AI in Education Survey',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">AI Education Survey</h1>
            <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Research Invitation</p>
          </div>
          
          <div style="padding: 30px; background: white;">
            <h2 style="color: #1f2937; margin-top: 0;">You're Invited to Participate</h2>
            <p style="color: #4b5563; line-height: 1.6;">
              Hello! You've been invited to participate in our research survey about AI integration in education.
              As a member of the <strong>${group}</strong> group, your perspective is valuable to our research.
            </p>
            
            <div style="background: #f0f9ff; border-left: 4px solid #6366f1; padding: 20px; margin: 20px 0;">
              <h3 style="color: #1f2937; margin: 0 0 10px 0;">About This Survey</h3>
              <ul style="color: #4b5563; margin: 0; padding-left: 20px;">
                <li>Takes approximately 10-15 minutes to complete</li>
                <li>Your responses will remain completely anonymous</li>
                <li>Data will be used for educational research purposes only</li>
                <li>You can save progress and return later</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}" 
                 style="background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                Start Survey
              </a>
            </div>
            
            <p style="color: #4b5563; line-height: 1.6; font-size: 14px;">
              When you click the link above, you'll be asked to enter your email address to receive an access code.
              This ensures secure, anonymous participation in our research.
            </p>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            
            <p style="color: #9ca3af; font-size: 12px; text-align: center;">
              This survey is part of the "No Concept Left Behind" research initiative.<br>
              If you have questions, please contact the research team.
            </p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error('❌ Invitation email failed:', error);
      return false;
    }

    console.log('✅ Invitation email sent successfully:', data?.id);
    return true;

  } catch (error) {
    console.error('❌ Invitation email service error:', error);
    return false;
  }
}
