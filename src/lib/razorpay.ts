import Razorpay from 'razorpay';
import crypto from 'crypto';

export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export const SUBSCRIPTION_PLANS = {
  broker: {
    name: 'Broker Plan',
    amount: 100000, // ₹1000 in paise
    currency: 'INR',
    description: 'Monthly subscription for brokers',
  },
  owner: {
    name: 'Owner Plan',
    amount: 80000, // ₹800 in paise
    currency: 'INR',
    description: 'Monthly subscription for property owners',
  },
  room_sharer: {
    name: 'Room Sharer Plan',
    amount: 50000, // ₹500 in paise
    currency: 'INR',
    description: 'Monthly subscription for room sharers',
  },
};

export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  const body = orderId + '|' + paymentId;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    .update(body.toString())
    .digest('hex');

  return expectedSignature === signature;
}

export function calculateSubscriptionEndDate(startDate: Date): Date {
  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + 1);
  return endDate;
}
