'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  CreditCard,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Crown,
  Star,
  Zap,
  Download,
  RefreshCw,
  ArrowUpCircle,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { formatPrice, formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function Subscription() {
  const { data: session } = useSession();
  const router = useRouter();
  const [subscriptionData, setSubscriptionData] = useState<any>(null);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpgrading, setIsUpgrading] = useState(false);

  useEffect(() => {
    if (session?.user?.id) {
      fetchSubscriptionData();
    }
  }, [session]);

  const fetchSubscriptionData = async () => {
    try {
      setIsLoading(true);
      
      // In a real app, you'd fetch from your API
      // For now, we'll use mock data based on user role
      const mockSubscriptionData = {
        plan: session?.user?.role || 'owner',
        status: 'active',
        startDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
        endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
        amount: session?.user?.role === 'broker' ? 1000 : session?.user?.role === 'owner' ? 800 : 500,
        autoRenew: true,
      };

      const mockPaymentHistory = [
        {
          id: '1',
          date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          amount: mockSubscriptionData.amount,
          status: 'completed',
          plan: mockSubscriptionData.plan,
          paymentId: 'pay_' + Math.random().toString(36).substr(2, 9),
        },
        {
          id: '2',
          date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
          amount: mockSubscriptionData.amount,
          status: 'completed',
          plan: mockSubscriptionData.plan,
          paymentId: 'pay_' + Math.random().toString(36).substr(2, 9),
        },
      ];

      setSubscriptionData(mockSubscriptionData);
      setPaymentHistory(mockPaymentHistory);
    } catch (error) {
      console.error('Failed to fetch subscription data:', error);
      toast.error('Failed to fetch subscription data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpgrade = (newPlan: string) => {
    setIsUpgrading(true);
    router.push(`/payment?plan=${newPlan}&upgrade=true`);
  };

  const toggleAutoRenew = async () => {
    try {
      // In a real app, you'd call your API
      setSubscriptionData(prev => ({
        ...prev,
        autoRenew: !prev.autoRenew,
      }));
      toast.success(`Auto-renewal ${subscriptionData.autoRenew ? 'disabled' : 'enabled'}`);
    } catch (error) {
      toast.error('Failed to update auto-renewal setting');
    }
  };

  const downloadInvoice = (paymentId: string) => {
    // In a real app, you'd generate and download the invoice
    toast.success('Invoice download started');
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  const plans = [
    {
      name: 'Room Sharer',
      price: 500,
      icon: Star,
      color: 'from-blue-500 to-blue-600',
      features: ['List spare rooms', 'Basic analytics', '5 photos per listing', 'Email support'],
    },
    {
      name: 'Property Owner',
      price: 800,
      icon: Zap,
      color: 'from-green-500 to-green-600',
      features: ['Unlimited listings', 'Advanced analytics', '10 photos per listing', 'Priority support'],
    },
    {
      name: 'Broker',
      price: 1000,
      icon: Crown,
      color: 'from-purple-500 to-purple-600',
      features: ['Premium features', 'Client management', '15 photos per listing', 'Phone support'],
    },
  ];

  const currentPlan = plans.find(plan => plan.name.toLowerCase().replace(' ', '_') === subscriptionData?.plan);
  const daysUntilExpiry = subscriptionData ? Math.ceil((new Date(subscriptionData.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Subscription</h1>
          <p className="text-muted-foreground">
            Manage your subscription and billing information
          </p>
        </div>

        {/* Current Subscription */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-foreground">Current Subscription</h2>
            {subscriptionData?.status === 'active' && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                <CheckCircle className="h-4 w-4 mr-1" />
                Active
              </span>
            )}
          </div>

          {currentPlan && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center space-x-4 mb-4">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${currentPlan.color} flex items-center justify-center`}>
                    <currentPlan.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground">{currentPlan.name}</h3>
                    <p className="text-2xl font-bold text-primary">{formatPrice(currentPlan.price)}/month</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <span className="font-medium text-foreground capitalize">{subscriptionData.status}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Started</span>
                    <span className="font-medium text-foreground">{formatDate(new Date(subscriptionData.startDate))}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Next billing</span>
                    <span className="font-medium text-foreground">{formatDate(new Date(subscriptionData.endDate))}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Auto-renewal</span>
                    <button
                      onClick={toggleAutoRenew}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        subscriptionData.autoRenew ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          subscriptionData.autoRenew ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-foreground mb-3">Plan Features</h4>
                <ul className="space-y-2">
                  {currentPlan.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm text-muted-foreground">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Expiry Warning */}
          {daysUntilExpiry <= 7 && daysUntilExpiry > 0 && (
            <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
                <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  Your subscription expires in {daysUntilExpiry} day{daysUntilExpiry > 1 ? 's' : ''}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Upgrade Options */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Upgrade Your Plan</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plans.map((plan, index) => {
              const isCurrentPlan = plan.name.toLowerCase().replace(' ', '_') === subscriptionData?.plan;
              const canUpgrade = plan.price > (currentPlan?.price || 0);
              
              return (
                <div
                  key={index}
                  className={`p-4 border rounded-lg ${
                    isCurrentPlan ? 'border-primary bg-primary/5' : 'border-border'
                  }`}
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${plan.color} flex items-center justify-center`}>
                      <plan.icon className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">{plan.name}</h3>
                      <p className="text-sm font-semibold text-primary">{formatPrice(plan.price)}/mo</p>
                    </div>
                  </div>
                  
                  {isCurrentPlan ? (
                    <span className="text-sm text-muted-foreground">Current Plan</span>
                  ) : canUpgrade ? (
                    <button
                      onClick={() => handleUpgrade(plan.name.toLowerCase().replace(' ', '_'))}
                      disabled={isUpgrading}
                      className="btn-primary text-sm w-full"
                    >
                      <ArrowUpCircle className="h-4 w-4 mr-1" />
                      Upgrade
                    </button>
                  ) : (
                    <span className="text-sm text-muted-foreground">Lower tier</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Payment History */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Payment History</h2>
            <button className="btn-outline text-sm">
              <RefreshCw className="h-4 w-4 mr-1" />
              Refresh
            </button>
          </div>

          {paymentHistory.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 text-sm font-medium text-muted-foreground">Date</th>
                    <th className="text-left py-3 text-sm font-medium text-muted-foreground">Plan</th>
                    <th className="text-left py-3 text-sm font-medium text-muted-foreground">Amount</th>
                    <th className="text-left py-3 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-left py-3 text-sm font-medium text-muted-foreground">Invoice</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentHistory.map((payment: any) => (
                    <tr key={payment.id} className="border-b border-border">
                      <td className="py-3 text-sm text-foreground">
                        {formatDate(new Date(payment.date))}
                      </td>
                      <td className="py-3 text-sm text-foreground capitalize">
                        {payment.plan.replace('_', ' ')}
                      </td>
                      <td className="py-3 text-sm font-medium text-foreground">
                        {formatPrice(payment.amount)}
                      </td>
                      <td className="py-3">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          payment.status === 'completed'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                        }`}>
                          {payment.status === 'completed' ? (
                            <CheckCircle className="h-3 w-3 mr-1" />
                          ) : (
                            <AlertTriangle className="h-3 w-3 mr-1" />
                          )}
                          {payment.status}
                        </span>
                      </td>
                      <td className="py-3">
                        <button
                          onClick={() => downloadInvoice(payment.paymentId)}
                          className="text-primary hover:text-primary/80 text-sm flex items-center"
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No payment history available</p>
            </div>
          )}
        </div>

        {/* Billing Information */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Billing Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Email</label>
              <input
                type="email"
                value={session?.user?.email || ''}
                disabled
                className="input w-full bg-muted"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Name</label>
              <input
                type="text"
                value={session?.user?.name || ''}
                disabled
                className="input w-full bg-muted"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              To update your billing information, please contact our support team.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
