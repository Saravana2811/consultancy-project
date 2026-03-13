import { Router } from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';

const router = Router();

function getRazorpayClient() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    return null;
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
}

/* =========================
   CREATE ORDER
   POST /api/payments/create-order
   Body: { amount }  — amount in INR (rupees)
========================= */
router.post('/create-order', async (req, res) => {
  try {
    const razorpay = getRazorpayClient();
    if (!razorpay) {
      return res.status(503).json({
        error: 'Payment service is not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in backend .env'
      });
    }

    const { amount } = req.body;
    if (!amount || isNaN(amount) || Number(amount) <= 0)
      return res.status(400).json({ error: 'Valid amount is required' });

    const options = {
      amount: Math.round(Number(amount) * 100), // convert to paise
      currency: 'INR',
      receipt: `ptm_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    return res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error('Razorpay create-order error:', err);
    return res.status(500).json({ error: 'Failed to create payment order' });
  }
});

/* =========================
   VERIFY PAYMENT
   POST /api/payments/verify
   Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature }
========================= */
router.post('/verify', (req, res) => {
  try {
    if (!process.env.RAZORPAY_KEY_SECRET) {
      return res.status(503).json({
        error: 'Payment verification is not configured. Add RAZORPAY_KEY_SECRET in backend .env'
      });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature)
      return res.status(400).json({ error: 'Missing payment verification fields' });

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature)
      return res.status(400).json({ ok: false, error: 'Payment verification failed' });

    return res.json({ ok: true, paymentId: razorpay_payment_id });
  } catch (err) {
    console.error('Razorpay verify error:', err);
    return res.status(500).json({ error: 'Verification error' });
  }
});

export default router;
