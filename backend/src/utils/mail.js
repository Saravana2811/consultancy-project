import nodemailer from 'nodemailer';
import PDFDocument from 'pdfkit';
import { Buffer } from 'buffer';

const {
  SMTP_HOST,
  SMTP_PORT = '587',
  SMTP_USER,
  SMTP_PASS,
  FROM_EMAIL
} = process.env;

async function createTransporter() {
  if (!SMTP_USER || !SMTP_PASS) {
    console.warn('⚠️  SMTP credentials missing — email disabled');
    return null;
  }
  
  const port = Number(SMTP_PORT);
  const isSecure = port === 465;
  const isGmail =
    SMTP_HOST === 'smtp.gmail.com' || SMTP_USER.endsWith('@gmail.com');
  
  const transportConfig = {
    ...(isGmail
      ? { service: 'gmail' }
      : { host: SMTP_HOST, port }),
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS
    },
    secure: isSecure,
    tls: {
      rejectUnauthorized: false,
      minVersion: 'TLSv1.2'
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,
    pool: true,
    maxConnections: 5,
    rateLimit: 5
  };
  
  const t = nodemailer.createTransport(transportConfig);
  
  try {
    console.log(`🔄 Verifying SMTP connection to ${isGmail ? 'Gmail' : SMTP_HOST}:${port}...`);
    await t.verify();
    console.log('✅ SMTP transporter verified successfully');
    return t;
  } catch (err) {
    console.error('❌ SMTP verification failed:', err?.message || err);
    console.error('💡 Troubleshooting tips:');
    if (isGmail) {
      console.error('   • Ensure you are using an App Password (not your regular Gmail password)');
      console.error('   • Enable 2-Step Verification in your Google Account');
      console.error('   • Create an App Password at: https://myaccount.google.com/apppasswords');
      console.error('   • Check if "Less secure app access" is enabled (if not using App Password)');
    } else {
      console.error(`   • Verify SMTP host: ${SMTP_HOST}`);
      console.error(`   • Verify SMTP port: ${port}`);
      console.error('   • Check firewall/network settings');
    }
    console.error(`   • Current SMTP_USER: ${SMTP_USER}`);
    console.error(`   • Current SMTP_PORT: ${port} (secure: ${isSecure})`);
    console.error('   • Verify SMTP credentials are correct\n');
    console.warn('⚠️  Email functionality will be disabled. Application will continue without email.');
    return null;
  }
}

let transporter = null;
let transporterPromise = null;

// Initialize transporter
async function getTransporter() {
  if (transporter) return transporter;
  if (transporterPromise) return transporterPromise;
  
  transporterPromise = createTransporter().then(t => {
    transporter = t;
    return t;
  });
  
  return transporterPromise;
}

// Generate PDF buffer for order bill
async function generateBillPDF(orderDetails) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const buffers = [];
      
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      const {
        orderId,
        customerName,
        productTitle,
        lengthMeters,
        colors,
        phone,
        gstNumber,
        address,
        city,
        state,
        pincode,
        pricePerMeter,
        subtotal,
        discount,
        deliveryCharge,
        total,
        deliveryDate,
        paymentMethod
      } = orderDetails;

      // Header with purple background
      doc.rect(0, 0, doc.page.width, 120).fill('#7b5cf1');
      
      // Company name
      doc.fillColor('#ffffff')
         .fontSize(28)
         .font('Helvetica-Bold')
         .text('Prema Textile Mills', 50, 40, { align: 'center' });
      
      doc.fontSize(14)
         .font('Helvetica')
         .text('Your Order Bill', 50, 75, { align: 'center' });

      // Reset to black for body
      doc.fillColor('#000000');
      
      // Thank you message
      doc.fontSize(18)
         .font('Helvetica-Bold')
         .fillColor('#7b5cf1')
         .text(`Thank you for your order, ${customerName}!`, 50, 150);

      // Order ID box
      doc.fontSize(10)
         .fillColor('#6b7280')
         .font('Helvetica')
         .text('ORDER ID', 50, 190);
      
      doc.fontSize(16)
         .fillColor('#7b5cf1')
         .font('Helvetica-Bold')
         .text(orderId, 50, 205);

      let yPos = 250;

      // Order Details Section
      doc.fontSize(14)
         .fillColor('#000000')
         .font('Helvetica-Bold')
         .text('Order Details', 50, yPos);
      
      yPos += 5;
      doc.moveTo(50, yPos).lineTo(545, yPos).stroke('#e5e7eb');
      yPos += 20;

      doc.fontSize(11)
         .font('Helvetica')
         .fillColor('#6b7280');
      
      const details = [
        ['Product:', productTitle],
        ['Length:', `${lengthMeters} meters`],
        ['Colors:', colors],
        ['Price per Meter:', `₹${pricePerMeter}`]
      ];

      details.forEach(([label, value]) => {
        doc.text(label, 50, yPos);
        doc.font('Helvetica-Bold').fillColor('#000000').text(value, 300, yPos, { align: 'right', width: 245 });
        doc.font('Helvetica').fillColor('#6b7280');
        yPos += 25;
      });

      yPos += 10;

      // Billing Summary Section
      doc.fontSize(14)
         .fillColor('#000000')
         .font('Helvetica-Bold')
         .text('Billing Summary', 50, yPos);
      
      yPos += 5;
      doc.moveTo(50, yPos).lineTo(545, yPos).stroke('#e5e7eb');
      yPos += 20;

      doc.fontSize(11)
         .font('Helvetica')
         .fillColor('#6b7280');

      const discountAmount = (subtotal * discount) / 100;
      
      const billing = [
        ['Subtotal:', `₹${subtotal.toLocaleString()}`],
        [`Discount (${discount}%):`, `- ₹${discountAmount.toLocaleString()}`, '#ef4444'],
        ['Delivery Charge:', `₹${deliveryCharge}`]
      ];

      billing.forEach(([label, value, color]) => {
        doc.text(label, 50, yPos);
        doc.fillColor(color || '#000000').text(value, 300, yPos, { align: 'right', width: 245 });
        doc.fillColor('#6b7280');
        yPos += 25;
      });

      // Total line
      doc.moveTo(50, yPos).lineTo(545, yPos).stroke('#e5e7eb');
      yPos += 15;

      doc.fontSize(16)
         .font('Helvetica-Bold')
         .fillColor('#000000')
         .text('Total Amount:', 50, yPos);
      
      doc.fillColor('#22c55e')
         .text(`₹${total.toLocaleString()}`, 300, yPos, { align: 'right', width: 245 });

      yPos += 40;

      // Delivery Address Section
      doc.fontSize(14)
         .fillColor('#000000')
         .font('Helvetica-Bold')
         .text('Delivery Address', 50, yPos);
      
      yPos += 5;
      doc.moveTo(50, yPos).lineTo(545, yPos).stroke('#e5e7eb');
      yPos += 20;

      doc.fontSize(11)
         .font('Helvetica-Bold')
         .fillColor('#000000')
         .text(customerName, 50, yPos);
      
      yPos += 20;

      doc.font('Helvetica')
         .fillColor('#6b7280')
         .text(address, 50, yPos);
      
      yPos += 20;

      doc.text(`${city}, ${state} - ${pincode}`, 50, yPos);
      yPos += 25;

      doc.text(`Phone: ${phone}`, 50, yPos);
      yPos += 20;

      doc.text(`GST: ${gstNumber}`, 50, yPos);
      yPos += 35;

      // Delivery Date Box
      doc.rect(50, yPos, 495, 60).fill('#eff6ff');
      doc.fontSize(11)
         .font('Helvetica-Bold')
         .fillColor('#1e40af')
         .text('📦 Estimated Delivery', 60, yPos + 15);
      
      doc.fontSize(13)
         .fillColor('#3b82f6')
         .text(deliveryDate, 60, yPos + 35);

      yPos += 75;

      // Payment Method Box
      doc.rect(50, yPos, 495, 60).fill('#f0fdf4');
      doc.fontSize(11)
         .font('Helvetica-Bold')
         .fillColor('#166534')
         .text('✓ Payment Method', 60, yPos + 15);
      
      doc.fontSize(13)
         .fillColor('#22c55e')
         .text(paymentMethod.toUpperCase(), 60, yPos + 35);

      // Footer
      const footerY = doc.page.height - 80;
      doc.fontSize(9)
         .font('Helvetica')
         .fillColor('#6b7280')
         .text('Thank you for choosing Prema Textile Mills!', 50, footerY, { align: 'center', width: 495 });
      
      doc.fontSize(8)
         .text('© 2025 Prema Textile Mills. All rights reserved.', 50, footerY + 20, { align: 'center', width: 495 });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

export async function sendWelcomeEmail(to, name = 'Customer') {
  const transporter = await getTransporter();
  if (!transporter) {
    console.warn('Email skipped — transporter not ready');
    return { ok: false, skipped: true };
  }
  const from = FROM_EMAIL || SMTP_USER;
  try {
    await transporter.sendMail({
      from: `Prema Textile Mills <${from}>`,
      to,
      subject: `Welcome to Prema Textile Mills, ${name}!`,
      text: `Hi ${name},
Welcome to Prema Textile Mills!

Your account has been successfully created. You can now explore our premium textile products, track orders, and manage your profile with ease.

If you need any assistance, feel free to reply to this email — we’re always happy to help.

Warm regards,
Prema Textile Mills Team
`,
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.6;color:#1f2937">
          <h2 style="color:#0f172a">Welcome to Prema Textile Mills, ${name} 👋</h2>
          <p>Your account has been <strong>successfully created</strong>.</p>
          <p>
            You can now explore our premium textile collections, track orders,
            and manage your account with ease.
          </p>
          <p>
            If you need any assistance, simply reply to this email —
            our team will be happy to help.
          </p>
          <p style="margin-top:20px">
            <strong>Warm regards,</strong><br/>
            Textile Mills Team
          </p>
        </div>
      `
    });
    console.log(`📧 Welcome email sent to ${to}`);
    return { ok: true };
  } catch (err) {
    console.error(`❌ Email send failed for ${to}:`, err?.message || err);
    return { ok: false, error: err?.message || 'Email failed' };
  }
}

export async function sendBillEmail(to, orderDetails) {
  const transporter = await getTransporter();
  if (!transporter) {
    console.warn('Email skipped — transporter not ready');
    return { ok: false, skipped: true };
  }
  const from = FROM_EMAIL || SMTP_USER;
  
  const {
    orderId,
    customerName,
    productTitle,
    lengthMeters,
    colors,
    phone,
    gstNumber,
    address,
    city,
    state,
    pincode,
    pricePerMeter,
    subtotal,
    discount,
    deliveryCharge,
    total,
    deliveryDate,
    paymentMethod
  } = orderDetails;

  try {
    // Generate PDF
    const pdfBuffer = await generateBillPDF(orderDetails);

    await transporter.sendMail({
      from: `Prema Textile Mills <${from}>`,
      to,
      subject: `Your Order Bill - ${orderId} | Prema Textile Mills`,
      text: `Hi ${customerName},

Thank you for your order at Prema Textile Mills!

Order Details:
--------------
Order ID: ${orderId}
Product: ${productTitle}
Length: ${lengthMeters} meters
Colors: ${colors}
Price per Meter: ₹${pricePerMeter}

Billing Summary:
---------------
Subtotal: ₹${subtotal.toLocaleString()}
Discount: ${discount}%
Delivery Charge: ₹${deliveryCharge}
Total Amount: ₹${total.toLocaleString()}

Delivery Address:
----------------
${customerName}
${address}
${city}, ${state} - ${pincode}
Phone: ${phone}
GST Number: ${gstNumber}

Payment Method: ${paymentMethod}
Estimated Delivery: ${deliveryDate}

Your order will be processed and shipped soon. You can track your order status using the Order ID.

If you have any questions, feel free to reply to this email.

Thank you for choosing Prema Textile Mills!

Warm regards,
Prema Textile Mills Team
`,
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.6;color:#1f2937;max-width:600px;margin:0 auto">
          <div style="background:#7b5cf1;color:white;padding:20px;text-align:center;border-radius:8px 8px 0 0">
            <h1 style="margin:0;font-size:24px">Prema Textile Mills</h1>
            <p style="margin:8px 0 0 0;font-size:14px">Your Order Bill</p>
          </div>
          
          <div style="padding:20px;background:#ffffff;border:1px solid #e5e7eb;border-top:none">
            <h2 style="color:#7b5cf1;margin-top:0">Thank you for your order, ${customerName}! 🎉</h2>
            
            <div style="background:#f9fafb;padding:16px;border-radius:8px;margin:20px 0">
              <div style="color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:1px">Order ID</div>
              <div style="font-size:18px;font-weight:700;color:#7b5cf1;margin-top:4px">${orderId}</div>
            </div>

            <h3 style="color:#0f172a;border-bottom:2px solid #e5e7eb;padding-bottom:8px">Order Details</h3>
            <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
              <tr>
                <td style="padding:8px 0;color:#6b7280">Product:</td>
                <td style="padding:8px 0;text-align:right;font-weight:600">${productTitle}</td>
              </tr>
              <tr>
                <td style="padding:8px 0;color:#6b7280">Length:</td>
                <td style="padding:8px 0;text-align:right;font-weight:600">${lengthMeters} meters</td>
              </tr>
              <tr>
                <td style="padding:8px 0;color:#6b7280">Colors:</td>
                <td style="padding:8px 0;text-align:right;font-weight:600">${colors}</td>
              </tr>
              <tr>
                <td style="padding:8px 0;color:#6b7280">Price per Meter:</td>
                <td style="padding:8px 0;text-align:right;font-weight:600">₹${pricePerMeter}</td>
              </tr>
            </table>

            <h3 style="color:#0f172a;border-bottom:2px solid #e5e7eb;padding-bottom:8px">Billing Summary</h3>
            <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
              <tr>
                <td style="padding:8px 0;color:#6b7280">Subtotal:</td>
                <td style="padding:8px 0;text-align:right">₹${subtotal.toLocaleString()}</td>
              </tr>
              <tr>
                <td style="padding:8px 0;color:#6b7280">Discount (${discount}%):</td>
                <td style="padding:8px 0;text-align:right;color:#ef4444">- ₹${((subtotal * discount) / 100).toLocaleString()}</td>
              </tr>
              <tr>
                <td style="padding:8px 0;color:#6b7280">Delivery Charge:</td>
                <td style="padding:8px 0;text-align:right">₹${deliveryCharge}</td>
              </tr>
              <tr style="border-top:2px solid #e5e7eb">
                <td style="padding:12px 0;font-size:18px;font-weight:700">Total Amount:</td>
                <td style="padding:12px 0;text-align:right;font-size:18px;font-weight:700;color:#22c55e">₹${total.toLocaleString()}</td>
              </tr>
            </table>

            <h3 style="color:#0f172a;border-bottom:2px solid #e5e7eb;padding-bottom:8px">Delivery Address</h3>
            <div style="background:#f9fafb;padding:16px;border-radius:8px;margin-bottom:20px">
              <div style="font-weight:600;margin-bottom:4px">${customerName}</div>
              <div style="color:#6b7280">${address}</div>
              <div style="color:#6b7280">${city}, ${state} - ${pincode}</div>
              <div style="color:#6b7280;margin-top:8px">Phone: ${phone}</div>
              <div style="color:#6b7280">GST: ${gstNumber}</div>
            </div>

            <div style="background:#eff6ff;padding:16px;border-radius:8px;border-left:4px solid #3b82f6;margin-bottom:20px">
              <div style="font-weight:600;color:#1e40af;margin-bottom:4px">📦 Estimated Delivery</div>
              <div style="color:#3b82f6;font-size:16px;font-weight:600">${deliveryDate}</div>
            </div>

            <div style="background:#f0fdf4;padding:16px;border-radius:8px;border-left:4px solid #22c55e">
              <div style="font-weight:600;color:#166534;margin-bottom:4px">✓ Payment Method</div>
              <div style="color:#22c55e;text-transform:uppercase;font-weight:600">${paymentMethod}</div>
            </div>

            <p style="margin-top:30px;color:#6b7280;font-size:14px;text-align:center">
              If you have any questions, feel free to reply to this email.<br/>
              Thank you for choosing Prema Textile Mills!
            </p>
          </div>

          <div style="background:#f9fafb;padding:16px;text-align:center;border-radius:0 0 8px 8px;border:1px solid #e5e7eb;border-top:none">
            <p style="margin:0;color:#6b7280;font-size:12px">
              © 2025 Prema Textile Mills. All rights reserved.
            </p>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: `Bill_${orderId}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    });
    console.log(`📧 Bill email sent to ${to} for order ${orderId}`);
    return { ok: true };
  } catch (err) {
    console.error(`❌ Bill email send failed for ${to}:`, err?.message || err);
    return { ok: false, error: err?.message || 'Bill email failed' };
  }
}