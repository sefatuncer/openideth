function layout(content: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background: #f8fafc; }
    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .card { background: #fff; border-radius: 8px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .logo { font-size: 24px; font-weight: bold; color: #2563eb; margin-bottom: 24px; }
    h1 { font-size: 20px; color: #0f172a; margin: 0 0 16px; }
    p { font-size: 14px; color: #64748b; line-height: 1.6; margin: 0 0 12px; }
    .btn { display: inline-block; background: #2563eb; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px; }
    .footer { text-align: center; margin-top: 32px; font-size: 12px; color: #94a3b8; }
    .highlight { color: #2563eb; font-weight: 600; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="logo">OpenIDEth</div>
      ${content}
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} OpenIDEth. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;
}

export function welcomeTemplate(name: string): string {
  return layout(`
    <h1>Welcome to OpenIDEth, ${name}!</h1>
    <p>Your account has been created successfully. You can now browse properties, create agreements, and manage your rentals.</p>
    <p style="margin-top: 24px;">
      <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard" class="btn">Go to Dashboard</a>
    </p>
  `);
}

export function paymentReminderTemplate(
  name: string,
  amount: string,
  dueDate: string,
  propertyTitle: string,
): string {
  return layout(`
    <h1>Payment Reminder</h1>
    <p>Hi ${name},</p>
    <p>Your rent payment of <span class="highlight">$${amount}</span> for <strong>${propertyTitle}</strong> is due on <strong>${dueDate}</strong>.</p>
    <p>Please make sure to complete your payment on time to avoid any late fees.</p>
    <p style="margin-top: 24px;">
      <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/payments/pay" class="btn">Pay Now</a>
    </p>
  `);
}

export function agreementNotificationTemplate(
  name: string,
  propertyTitle: string,
  action: string,
): string {
  return layout(`
    <h1>Agreement Update</h1>
    <p>Hi ${name},</p>
    <p>Your rental agreement for <strong>${propertyTitle}</strong> has been <span class="highlight">${action}</span>.</p>
    <p style="margin-top: 24px;">
      <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/agreements" class="btn">View Agreements</a>
    </p>
  `);
}

export function kycStatusTemplate(
  name: string,
  status: string,
  reason?: string,
): string {
  const statusText = status === 'APPROVED'
    ? 'Your identity has been <span class="highlight">verified</span> successfully.'
    : `Your verification was <span class="highlight">rejected</span>.${reason ? ` Reason: ${reason}` : ''}`;

  return layout(`
    <h1>KYC Verification Update</h1>
    <p>Hi ${name},</p>
    <p>${statusText}</p>
    <p style="margin-top: 24px;">
      <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/kyc" class="btn">View Status</a>
    </p>
  `);
}

export function emailVerificationTemplate(name: string, token: string): string {
  const url = `${process.env.API_URL || 'http://localhost:4000'}/api/v1/auth/verify-email/${token}`;
  return layout(`
    <h1>Verify Your Email</h1>
    <p>Hi ${name},</p>
    <p>Please click the button below to verify your email address.</p>
    <p style="margin-top: 24px;">
      <a href="${url}" class="btn">Verify Email</a>
    </p>
    <p style="margin-top: 16px; font-size: 12px;">If the button doesn't work, copy this link: ${url}</p>
  `);
}
