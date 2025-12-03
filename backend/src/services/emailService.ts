import nodemailer from 'nodemailer';

// Create reusable transporter
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // use SSL
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verify transporter configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Email transporter error:', error);
  } else {
    console.log('✅ Email service ready');
  }
});

export const sendRFPEmail = async (vendor: any, rfp: any) => {
  try {
    if (!rfp || !rfp.title) {
      throw new Error('Invalid RFP data passed to sendRFPEmail');
    }

    const vendorEmail = vendor.email;
    const vendorName = vendor.name || 'Vendor';

    const emailBody = `
Dear ${vendorName},

We are requesting proposals for the following procurement:

Title: ${rfp.title}
Description: ${rfp.description}
Budget: $${Number(rfp.budget).toLocaleString()}
Delivery Timeline: ${rfp.deliveryDays} days
Payment Terms: ${rfp.paymentTerms}
Warranty: ${rfp.warrantyMonths} months

Items Required:
${
  Array.isArray(rfp.items)
    ? rfp.items
        .map(
          (item: any, index: number) =>
            `${index + 1}. ${item.name} (Qty: ${item.quantity})
   Specifications: ${item.specifications}`
        )
        .join('\n')
    : 'Details in attached RFP.'
}

Please reply to this email with your proposal including:
- Total price
- Delivery timeline
- Warranty terms
- Any additional notes

We look forward to your response.

Best regards,
Procurement Team
`;

    const info = await transporter.sendMail({
      from: `"RFP System" <${process.env.EMAIL_USER}>`,
      to: vendorEmail,
      subject: `RFP: ${rfp.title}`,
      text: emailBody,
    });

    console.log('✅ Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error('❌ Error sending email:', error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};
