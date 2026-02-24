const nodemailer = require('nodemailer');

// Check if email is configured
const isEmailConfigured = () => {
  return !!(process.env.GMAIL_USER && process.env.GMAIL_PASS);
};

// Create reusable transporter
const createTransporter = () => {
  if (!isEmailConfigured()) {
    return null;
  }
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });
};

// Send ticket email with QR code
const sendTicketEmail = async (to, ticketData) => {
  const { 
    eventName, 
    ticketId, 
    qrCode, 
    participantName, 
    eventStartDate,
    eventType,
    merchandiseDetails 
  } = ticketData;

  let itemDetails = '';
  if (eventType === 'MERCHANDISE' && merchandiseDetails) {
    itemDetails = `
      <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 15px 0;">
        <h4 style="margin-top: 0;">Merchandise Details</h4>
        <p><strong>Item:</strong> ${merchandiseDetails.itemName}</p>
        ${merchandiseDetails.size ? `<p><strong>Size:</strong> ${merchandiseDetails.size}</p>` : ''}
        ${merchandiseDetails.color ? `<p><strong>Color:</strong> ${merchandiseDetails.color}</p>` : ''}
        <p><strong>Quantity:</strong> ${merchandiseDetails.quantity}</p>
        <p><strong>Total Price:</strong> ₹${merchandiseDetails.totalPrice}</p>
      </div>
    `;
  }

  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: to,
    subject: `Your Ticket for ${eventName} - Felicity`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0;">Ticket Confirmed!</h1>
        </div>
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
          <p style="font-size: 16px;">Dear <strong>${participantName}</strong>,</p>
          <p>Your registration for <strong>${eventName}</strong> has been confirmed!</p>
          ${itemDetails}
          <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #667eea;">
            <h3 style="margin-top: 0; color: #667eea;">Ticket Details</h3>
            <p><strong>Ticket ID:</strong> <code style="background: #e7f3ff; padding: 5px 10px; border-radius: 4px;">${ticketId}</code></p>
            <p><strong>Event:</strong> ${eventName}</p>
            <p><strong>Event Date:</strong> ${new Date(eventStartDate).toLocaleDateString('en-IN', { 
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
            })}</p>
          </div>
          <div style="text-align: center; background: white; padding: 30px; border-radius: 10px; margin: 20px 0;">
            <p style="font-weight: bold; margin-bottom: 15px;">Your Entry QR Code</p>
            <img src="${qrCode}" alt="QR Code" style="max-width: 250px; border: 2px solid #667eea; border-radius: 8px; padding: 10px;"/>
            <p style="color: #666; font-size: 14px; margin-top: 15px;">Present this QR code at the event venue</p>
          </div>
          <div style="background: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107;">
            <p style="margin: 0; font-size: 14px;"><strong>Important:</strong> Save this email or take a screenshot of the QR code for entry.</p>
          </div>
        </div>
      </div>
    `,
  };

  try {
    const transporter = createTransporter();
    if (!transporter) {
      console.log('[EMAIL SKIP] Gmail not configured. Ticket details:');
      console.log(`  To: ${to}`);
      console.log(`  Event: ${eventName}`);
      console.log(`  Ticket ID: ${ticketId}`);
      return { success: false, error: 'Email not configured' };
    }
    await transporter.sendMail(mailOptions);
    console.log('Ticket email sent to:', to);
    return { success: true };
  } catch (error) {
    console.error('Email sending error:', error.message);
    // Don't throw - email failure shouldn't break the flow
    return { success: false, error: error.message };
  }
};

// Send password reset email to organizer
const sendPasswordResetEmail = async (to, organizerName, newPassword) => {
  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: to,
    subject: 'Password Reset Approved - Felicity Organizer Account',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #667eea; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0;">Password Reset</h1>
        </div>
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
          <p>Dear <strong>${organizerName}</strong>,</p>
          <p>Your password reset request has been <strong>approved</strong>.</p>
          <div style="background: #fff3cd; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <h3 style="margin-top: 0;">New Login Credentials</h3>
            <p><strong>Email:</strong> ${to}</p>
            <p><strong>New Password:</strong> <code style="background: white; padding: 8px 15px; border-radius: 4px;">${newPassword}</code></p>
          </div>
          <p style="color: #dc3545;"><strong>Please change this password immediately after logging in.</strong></p>
        </div>
      </div>
    `,
  };

  try {
    const transporter = createTransporter();
    if (!transporter) {
      console.log('[EMAIL SKIP] Gmail not configured. Password reset details:');
      console.log(`  To: ${to}`);
      console.log(`  New Password: ${newPassword}`);
      return { success: false, error: 'Email not configured' };
    }
    await transporter.sendMail(mailOptions);
    console.log('Password reset email sent to:', to);
    return { success: true };
  } catch (error) {
    console.error('Email sending error:', error.message);
    return { success: false, error: error.message };
  }
};

// Send organizer credentials when admin creates account
const sendOrganizerCredentials = async (to, organizerName, email, password) => {
  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: to,
    subject: 'Welcome to Felicity - Your Organizer Account',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0;">Welcome to Felicity!</h1>
        </div>
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
          <p>Dear <strong>${organizerName}</strong>,</p>
          <p>Your organizer account has been created by the Felicity administrator.</p>
          <div style="background: #e7f3ff; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Your Login Credentials</h3>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Password:</strong> <code style="background: white; padding: 8px 15px; border-radius: 4px;">${password}</code></p>
          </div>
          <p>Please login and change your password for security.</p>
        </div>
      </div>
    `,
  };

  try {
    const transporter = createTransporter();
    if (!transporter) {
      console.log('[EMAIL SKIP] Gmail not configured. Organizer credentials:');
      console.log(`  To: ${to}`);
      console.log(`  Email: ${email}`);
      console.log(`  Password: ${password}`);
      return { success: false, error: 'Email not configured' };
    }
    await transporter.sendMail(mailOptions);
    console.log('Credentials email sent to:', to);
    return { success: true };
  } catch (error) {
    console.error('Email sending error:', error.message);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendTicketEmail,
  sendPasswordResetEmail,
  sendOrganizerCredentials,
};
