import nodemailer from 'nodemailer';

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  const host = process.env.EMAIL_HOST;
  const port = parseInt(process.env.EMAIL_PORT || '587', 10);
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASSWORD;

  if (host && user && pass) {
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass }
    });
    console.log('[Email] Configured SMTP transporter with host:', host);
  } else {
    console.log('[Email] SMTP credentials not set in .env. Running in console preview mode.');
  }

  return transporter;
}

export const EmailService = {
  /**
   * Send notification to KALA Team when a meeting is requested
   */
  async sendAdminNewMeetingAlert(meeting) {
    const adminEmail = process.env.EMAIL_FROM || 'KalaOriginals@gmail.com';
    const subject = `[KALA Meeting Request] ${meeting.customerName} - ${meeting.date} at ${meeting.time}`;
    
    const html = `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f5f3ef; padding: 40px 20px; color: #1c1a17;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e6e2dc; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
          <div style="background-color: #06413f; padding: 30px; text-align: center;">
            <h1 style="color: #ffffff; font-size: 24px; letter-spacing: 2px; margin: 0; font-weight: 700;">K A L A</h1>
            <p style="color: #d2a679; margin: 6px 0 0 0; font-size: 13px; text-transform: uppercase; letter-spacing: 1.5px;">New Meeting Request (Pending Review)</p>
          </div>

          <div style="padding: 30px;">
            <h2 style="font-size: 20px; margin-top: 0; color: #1c1a17; border-bottom: 2px solid #06413f; padding-bottom: 10px;">Meeting Specifications</h2>
            
            <table style="width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 14px;">
              <tr>
                <td style="padding: 8px 0; color: #7c7770; width: 140px; font-weight: 600;">Customer:</td>
                <td style="padding: 8px 0; font-weight: 700; color: #1c1a17;">${meeting.customerName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #7c7770; font-weight: 600;">Email:</td>
                <td style="padding: 8px 0;"><a href="mailto:${meeting.customerEmail}" style="color: #06413f;">${meeting.customerEmail}</a></td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #7c7770; font-weight: 600;">Phone:</td>
                <td style="padding: 8px 0;"><a href="tel:${meeting.phone}" style="color: #06413f;">${meeting.phone}</a></td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #7c7770; font-weight: 600;">Company:</td>
                <td style="padding: 8px 0;">${meeting.companyName || 'N/A (Individual)'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #7c7770; font-weight: 600;">Date:</td>
                <td style="padding: 8px 0; font-weight: 700; color: #06413f;">${meeting.date}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #7c7770; font-weight: 600;">Time Slot:</td>
                <td style="padding: 8px 0; font-weight: 700; color: #06413f;">${meeting.time}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #7c7770; font-weight: 600;">Purpose:</td>
                <td style="padding: 8px 0; font-weight: 600;">${meeting.purpose}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #7c7770; font-weight: 600;">Current Status:</td>
                <td style="padding: 8px 0;"><span style="background-color: #fff3cd; color: #856404; padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 700;">PENDING APPROVAL</span></td>
              </tr>
            </table>

            ${meeting.message ? `
              <div style="margin-top: 20px; background: #f9f8f6; padding: 15px; border-left: 3px solid #06413f; border-radius: 4px;">
                <p style="margin: 0; font-size: 13px; color: #555;"><strong>Message / Requirements:</strong><br/>${meeting.message}</p>
              </div>
            ` : ''}

            <div style="margin-top: 30px; text-align: center;">
              <a href="http://localhost:5173/admin" style="display: inline-block; background-color: #06413f; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 6px; font-weight: 700; font-size: 14px; letter-spacing: 1px;">Open Admin Dashboard to Confirm / Cancel</a>
            </div>
          </div>
        </div>
      </div>
    `;

    return await this.sendMail({
      to: 'KalaOriginals@gmail.com',
      subject,
      html
    });
  },

  /**
   * Send acknowledgment to customer that meeting request is received and PENDING
   */
  async sendCustomerPendingReceipt(meeting) {
    const subject = `Your KALA Meeting Request has been received (${meeting.date} at ${meeting.time})`;

    const html = `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f5f3ef; padding: 40px 20px; color: #1c1a17;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e6e2dc;">
          <div style="background-color: #06413f; padding: 30px; text-align: center;">
            <h1 style="color: #ffffff; font-size: 24px; letter-spacing: 2px; margin: 0; font-weight: 700;">K A L A</h1>
            <p style="color: #d2a679; margin: 6px 0 0 0; font-size: 13px; letter-spacing: 1px;">DESIGNED. PRINTED. MADE FOR YOU.</p>
          </div>

          <div style="padding: 30px;">
            <h2 style="font-size: 18px; margin-top: 0; color: #1c1a17;">Hello ${meeting.customerName},</h2>
            <p style="font-size: 14px; line-height: 1.6; color: #4a4742;">
              Thank you for reaching out to KALA. We have received your consultation request for <strong>${meeting.purpose}</strong>.
            </p>

            <div style="background-color: #faf8f5; border: 1px solid #e6e2dc; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Requested Date:</strong> ${meeting.date}</p>
              <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Requested Time Slot:</strong> ${meeting.time}</p>
              <p style="margin: 0; font-size: 14px;"><strong>Status:</strong> <span style="color: #b27b10; font-weight: 700;">PENDING REVIEW</span></p>
            </div>

            <p style="font-size: 14px; line-height: 1.6; color: #4a4742;">
              Our team reviews all consultation slots against our production schedules. You will receive a formal confirmation email once your appointment is confirmed, or our representative may reach out via WhatsApp at <strong>${meeting.phone}</strong>.
            </p>

            <p style="font-size: 14px; line-height: 1.6; color: #4a4742; margin-top: 25px;">
              Need urgent assistance? Chat with us directly on WhatsApp at <a href="https://wa.me/919406030116" style="color: #06413f; font-weight: 700;">9406030116</a>.
            </p>

            <div style="margin-top: 30px; border-top: 1px solid #e6e2dc; padding-top: 20px; font-size: 12px; color: #7c7770; text-align: center;">
              KALA Originals Studio &bull; KalaOriginals@gmail.com &bull; @kala_originals
            </div>
          </div>
        </div>
      </div>
    `;

    return await this.sendMail({
      to: meeting.customerEmail,
      subject,
      html
    });
  },

  /**
   * Send confirmation email when Admin confirms the meeting
   */
  async sendCustomerMeetingConfirmed(meeting) {
    const subject = `Confirmed: Your KALA Consultation on ${meeting.date} at ${meeting.time}`;

    const html = `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f5f3ef; padding: 40px 20px; color: #1c1a17;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e6e2dc; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
          <div style="background-color: #06413f; padding: 30px; text-align: center;">
            <h1 style="color: #ffffff; font-size: 24px; letter-spacing: 2px; margin: 0; font-weight: 700;">K A L A</h1>
            <p style="color: #10b981; margin: 6px 0 0 0; font-size: 14px; font-weight: 700; letter-spacing: 1.5px;">&check; YOUR MEETING IS CONFIRMED</p>
          </div>

          <div style="padding: 30px;">
            <h2 style="font-size: 18px; margin-top: 0; color: #1c1a17;">Hello ${meeting.customerName},</h2>
            <p style="font-size: 14px; line-height: 1.6; color: #4a4742;">
              Great news! Your meeting with the KALA design & production team has been <strong>approved and confirmed</strong>.
            </p>

            <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <p style="margin: 0 0 8px 0; font-size: 15px; color: #06413f;"><strong>Date:</strong> ${meeting.date}</p>
              <p style="margin: 0 0 8px 0; font-size: 15px; color: #06413f;"><strong>Time:</strong> ${meeting.time}</p>
              <p style="margin: 0 0 8px 0; font-size: 14px; color: #06413f;"><strong>Topic:</strong> ${meeting.purpose}</p>
              <p style="margin: 0; font-size: 14px; color: #059669; font-weight: 700;"><strong>Status:</strong> CONFIRMED</p>
            </div>

            ${meeting.adminNotes ? `
              <div style="background: #f9f8f6; border-left: 3px solid #06413f; padding: 12px 16px; margin: 15px 0; font-size: 13px;">
                <strong>Notes from KALA team:</strong><br/>${meeting.adminNotes}
              </div>
            ` : ''}

            <p style="font-size: 14px; line-height: 1.6; color: #4a4742;">
              We will connect with you via Google Meet / WhatsApp Call at the scheduled time. Please have any sketches, logos, or apparel ideas ready so we can provide instant feasibility and pricing options.
            </p>

            <div style="margin-top: 30px; text-align: center;">
              <a href="https://wa.me/919406030116" style="display: inline-block; background-color: #25D366; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 700; font-size: 14px;">Connect on WhatsApp (9406030116)</a>
            </div>

            <div style="margin-top: 30px; border-top: 1px solid #e6e2dc; padding-top: 20px; font-size: 12px; color: #7c7770; text-align: center;">
              KALA &bull; Your Idea. Your Brand. Your Identity.
            </div>
          </div>
        </div>
      </div>
    `;

    return await this.sendMail({
      to: meeting.customerEmail,
      subject,
      html
    });
  },

  /**
   * Send cancellation email
   */
  async sendCustomerMeetingCancelled(meeting) {
    const subject = `Update on your KALA Meeting Request (${meeting.date})`;

    const html = `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f5f3ef; padding: 40px 20px; color: #1c1a17;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e6e2dc;">
          <div style="background-color: #1c1a17; padding: 30px; text-align: center;">
            <h1 style="color: #ffffff; font-size: 24px; letter-spacing: 2px; margin: 0; font-weight: 700;">K A L A</h1>
            <p style="color: #ef4444; margin: 6px 0 0 0; font-size: 13px; font-weight: 700; letter-spacing: 1px;">MEETING SLOT CANCELLED</p>
          </div>

          <div style="padding: 30px;">
            <h2 style="font-size: 18px; margin-top: 0; color: #1c1a17;">Hello ${meeting.customerName},</h2>
            <p style="font-size: 14px; line-height: 1.6; color: #4a4742;">
              Unfortunately, we are unable to fulfill your meeting on <strong>${meeting.date} at ${meeting.time}</strong> due to an unavoidable schedule conflict.
            </p>

            ${meeting.adminNotes ? `
              <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; padding: 12px 16px; margin: 15px 0; font-size: 13px; color: #991b1b;">
                <strong>Reason:</strong> ${meeting.adminNotes}
              </div>
            ` : ''}

            <p style="font-size: 14px; line-height: 1.6; color: #4a4742;">
              You can reschedule anytime by picking another slot on our website, or message us directly on WhatsApp at 9406030116.
            </p>

            <div style="margin-top: 25px; text-align: center;">
              <a href="http://localhost:5173/book-meeting" style="display: inline-block; background-color: #06413f; color: #ffffff; padding: 10px 22px; text-decoration: none; border-radius: 6px; font-weight: 700; font-size: 13px;">Reschedule on KALA</a>
            </div>
          </div>
        </div>
      </div>
    `;

    return await this.sendMail({
      to: meeting.customerEmail,
      subject,
      html
    });
  },

  async sendMail({ to, subject, html }) {
    const sender = process.env.EMAIL_FROM || 'KalaOriginals@gmail.com';
    const t = getTransporter();

    if (t) {
      try {
        const info = await t.sendMail({
          from: `"KALA Studio" <${sender}>`,
          to,
          subject,
          html
        });
        console.log(`[Email] Email sent successfully to ${to}. MessageId: ${info.messageId}`);
        return { success: true, messageId: info.messageId };
      } catch (err) {
        console.error(`[Email] Failed to send email to ${to}:`, err.message);
        return { success: false, error: err.message };
      }
    } else {
      console.log(`\n=== [EMAIL PREVIEW (NO SMTP CONFIGURED)] ===`);
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(`From: ${sender}`);
      console.log(`===========================================\n`);
      return { success: true, preview: true };
    }
  }
};
