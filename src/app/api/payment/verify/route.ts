import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { verifyRazorpaySignature, calculateSubscriptionEndDate, SUBSCRIPTION_PLANS } from '@/lib/razorpay';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Subscription from '@/models/Subscription';
import { sendSubscriptionConfirmationEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      plan,
    } = await request.json();

    // Verify signature
    const isSignatureValid = verifyRazorpaySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isSignatureValid) {
      return NextResponse.json(
        { error: 'Invalid payment signature' },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const planDetails = SUBSCRIPTION_PLANS[plan as keyof typeof SUBSCRIPTION_PLANS];
    const startDate = new Date();
    const endDate = calculateSubscriptionEndDate(startDate);

    // Create subscription record
    const subscription = await Subscription.create({
      user: user._id,
      plan,
      amount: planDetails.amount,
      currency: planDetails.currency,
      status: 'active',
      paymentId: razorpay_payment_id,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      startDate,
      endDate,
    });

    // Update user subscription
    await User.findByIdAndUpdate(user._id, {
      role: plan,
      subscription: {
        plan,
        status: 'active',
        startDate,
        endDate,
        paymentId: razorpay_payment_id,
      },
    });

    // Send confirmation email
    try {
      await sendSubscriptionConfirmationEmail(
        user.email,
        user.name,
        plan,
        planDetails.amount
      );
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
    }

    return NextResponse.json({
      message: 'Payment verified and subscription activated',
      subscription: {
        id: subscription._id,
        plan,
        status: 'active',
        startDate,
        endDate,
      },
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify payment' },
      { status: 500 }
    );
  }
}
