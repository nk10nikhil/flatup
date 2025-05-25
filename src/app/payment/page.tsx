'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Check, CreditCard, Shield, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

declare global {
  interface Window {
    Razorpay: any;
  }
}

// Component to handle search params with Suspense
function PaymentContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const plans = {
    owner: {
      name: 'Property Owner',
      price: 800,
      features: [
        'List unlimited properties',
        'Direct tenant communication',
        'Property analytics',
        'Photo uploads (up to 10 per listing)',
        'Email support',
      ],
    },
    broker: {
      name: 'Broker',
      price: 1000,
      features: [
        'List unlimited properties',
        'Advanced analytics dashboard',
        'Priority listing placement',
        'Photo uploads (up to 15 per listing)',
        'Phone & email support',
        'Client management tools',
      ],
    },
    room_sharer: {
      name: 'Room Sharer',
      price: 500,
      features: [
        'List your spare rooms',
        'Basic analytics',
        'Direct communication',
        'Photo uploads (up to 5 per listing)',
        'Email support',
      ],
    },
  };

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/auth/signin');
      return;
    }

    const plan = searchParams.get('plan');
    if (plan && plans[plan as keyof typeof plans]) {
      setSelectedPlan(plan);
    } else {
      setSelectedPlan('owner'); // Default plan
    }

    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [session, status, searchParams, router]);

  const handlePayment = async () => {
    if (!selectedPlan || !session) return;

    setIsLoading(true);

    try {
      // Create order
      const orderResponse = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plan: selectedPlan }),
      });

      const orderData = await orderResponse.json();

      if (!orderResponse.ok) {
        throw new Error(orderData.error || 'Failed to create order');
      }

      // Initialize Razorpay
      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'FlatUp',
        description: `${orderData.plan.name} - Monthly Subscription`,
        order_id: orderData.orderId,
        handler: async (response: any) => {
          try {
            // Verify payment
            const verifyResponse = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                plan: selectedPlan,
              }),
            });

            const verifyData = await verifyResponse.json();

            if (verifyResponse.ok) {
              toast.success('Payment successful! Your subscription is now active.');
              router.push('/dashboard');
            } else {
              throw new Error(verifyData.error || 'Payment verification failed');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            toast.error('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: session.user.name,
          email: session.user.email,
        },
        theme: {
          color: '#3B82F6',
        },
        modal: {
          ondismiss: () => {
            setIsLoading(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Failed to initiate payment. Please try again.');
      setIsLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const currentPlan = plans[selectedPlan as keyof typeof plans];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Complete Your Subscription
          </h1>
          <p className="text-xl text-muted-foreground">
            Choose your plan and start listing properties today
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Plan Selection */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Select Your Plan</h2>

            <div className="space-y-4">
              {Object.entries(plans).map(([key, plan]) => (
                <div
                  key={key}
                  className={`card p-6 cursor-pointer transition-all ${selectedPlan === key
                      ? 'border-primary bg-primary/5'
                      : 'hover:border-primary/50'
                    }`}
                  onClick={() => setSelectedPlan(key)}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">{plan.name}</h3>
                      <p className="text-2xl font-bold text-primary">₹{plan.price}/month</p>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 ${selectedPlan === key
                        ? 'border-primary bg-primary'
                        : 'border-border'
                      }`}>
                      {selectedPlan === key && (
                        <Check className="w-4 h-4 text-primary-foreground m-0.5" />
                      )}
                    </div>
                  </div>

                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm text-muted-foreground">
                        <Check className="w-4 h-4 text-primary mr-2 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Summary */}
          <div className="space-y-6">
            <div className="card p-6">
              <h2 className="text-2xl font-semibold text-foreground mb-6">Payment Summary</h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-foreground">Plan</span>
                  <span className="font-medium">{currentPlan?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground">Duration</span>
                  <span className="font-medium">1 Month</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground">Subtotal</span>
                  <span className="font-medium">₹{currentPlan?.price}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground">GST (18%)</span>
                  <span className="font-medium">₹{Math.round((currentPlan?.price || 0) * 0.18)}</span>
                </div>
                <div className="border-t border-border pt-4">
                  <div className="flex justify-between text-lg font-semibold">
                    <span className="text-foreground">Total</span>
                    <span className="text-primary">₹{Math.round((currentPlan?.price || 0) * 1.18)}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handlePayment}
                disabled={isLoading || !selectedPlan}
                className="btn-primary w-full flex items-center justify-center space-x-2"
              >
                <CreditCard className="w-5 h-5" />
                <span>{isLoading ? 'Processing...' : 'Pay Now'}</span>
              </button>

              <div className="mt-6 space-y-3">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Shield className="w-4 h-4 mr-2" />
                  <span>Secure payment powered by Razorpay</span>
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="w-4 h-4 mr-2" />
                  <span>Subscription starts immediately after payment</span>
                </div>
              </div>
            </div>

            <div className="card p-6 bg-muted/50">
              <h3 className="font-semibold text-foreground mb-3">What happens next?</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start">
                  <span className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs mr-3 mt-0.5">1</span>
                  Complete your payment securely
                </li>
                <li className="flex items-start">
                  <span className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs mr-3 mt-0.5">2</span>
                  Access your dashboard immediately
                </li>
                <li className="flex items-start">
                  <span className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs mr-3 mt-0.5">3</span>
                  Start listing your properties
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Loading fallback component
function PaymentFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
    </div>
  );
}

// Main component with Suspense boundary
export default function Payment() {
  return (
    <Suspense fallback={<PaymentFallback />}>
      <PaymentContent />
    </Suspense>
  );
}
