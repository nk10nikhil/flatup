'use client';

import Link from 'next/link';
import { Check, Star, Zap, Crown } from 'lucide-react';
import { MainLayout } from '@/components/layout/main-layout';

export default function Pricing() {
  const plans = [
    {
      name: 'Room Sharer',
      price: 500,
      icon: Star,
      description: 'Perfect for individuals with spare rooms',
      features: [
        'List your spare rooms',
        'Basic analytics dashboard',
        'Direct tenant communication',
        'Photo uploads (up to 5 per listing)',
        'Email support',
        'Mobile-friendly interface',
      ],
      popular: false,
      color: 'from-blue-500 to-blue-600',
    },
    {
      name: 'Property Owner',
      price: 800,
      icon: Zap,
      description: 'Ideal for property owners',
      features: [
        'List unlimited properties',
        'Advanced analytics dashboard',
        'Direct tenant communication',
        'Photo uploads (up to 10 per listing)',
        'Priority email support',
        'Property performance insights',
        'Tenant inquiry management',
      ],
      popular: true,
      color: 'from-green-500 to-green-600',
    },
    {
      name: 'Broker',
      price: 1000,
      icon: Crown,
      description: 'Best for real estate professionals',
      features: [
        'List unlimited properties',
        'Premium analytics dashboard',
        'Priority listing placement',
        'Photo uploads (up to 15 per listing)',
        'Phone & email support',
        'Client management tools',
        'Advanced reporting',
        'Featured listing options',
        'Bulk upload capabilities',
      ],
      popular: false,
      color: 'from-purple-500 to-purple-600',
    },
  ];

  const faqs = [
    {
      question: 'How does the subscription work?',
      answer: 'All subscriptions are monthly and auto-renewing. You can cancel anytime from your dashboard.',
    },
    {
      question: 'Can I upgrade or downgrade my plan?',
      answer: 'Yes, you can change your plan anytime. The new pricing will be prorated for the current billing cycle.',
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards, debit cards, UPI, and net banking through Razorpay.',
    },
    {
      question: 'Is there a free trial?',
      answer: 'We offer a 7-day free trial for new users to explore all features before committing to a plan.',
    },
    {
      question: 'Can I list properties in multiple cities?',
      answer: 'Yes, all plans allow you to list properties across all cities in India.',
    },
    {
      question: 'What happens if I cancel my subscription?',
      answer: 'Your listings will remain active until the end of your billing period, after which they will be deactivated.',
    },
  ];

  return (
    <MainLayout>
      <div className="py-16">
        <div className="container">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Choose the perfect plan for your property listing needs. All plans include our core features with no hidden fees.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`relative card p-8 ${
                  plan.popular ? 'border-primary shadow-lg scale-105' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-8">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r ${plan.color} flex items-center justify-center`}>
                    <plan.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-2">{plan.name}</h3>
                  <p className="text-muted-foreground mb-4">{plan.description}</p>
                  <div className="text-4xl font-bold text-foreground">
                    ₹{plan.price}
                    <span className="text-lg font-normal text-muted-foreground">/month</span>
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/auth/signup"
                  className={`btn w-full ${
                    plan.popular ? 'btn-primary' : 'btn-outline'
                  }`}
                >
                  Get Started
                </Link>
              </div>
            ))}
          </div>

          {/* Features Comparison */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-foreground text-center mb-8">
              Compare Plans
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full border border-border rounded-lg">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-4 font-semibold text-foreground">Features</th>
                    <th className="text-center p-4 font-semibold text-foreground">Room Sharer</th>
                    <th className="text-center p-4 font-semibold text-foreground">Property Owner</th>
                    <th className="text-center p-4 font-semibold text-foreground">Broker</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border">
                    <td className="p-4 text-foreground">Property Listings</td>
                    <td className="text-center p-4">5</td>
                    <td className="text-center p-4">Unlimited</td>
                    <td className="text-center p-4">Unlimited</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="p-4 text-foreground">Photo Uploads per Listing</td>
                    <td className="text-center p-4">5</td>
                    <td className="text-center p-4">10</td>
                    <td className="text-center p-4">15</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="p-4 text-foreground">Analytics Dashboard</td>
                    <td className="text-center p-4">Basic</td>
                    <td className="text-center p-4">Advanced</td>
                    <td className="text-center p-4">Premium</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="p-4 text-foreground">Priority Support</td>
                    <td className="text-center p-4">-</td>
                    <td className="text-center p-4">✓</td>
                    <td className="text-center p-4">✓</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="p-4 text-foreground">Featured Listings</td>
                    <td className="text-center p-4">-</td>
                    <td className="text-center p-4">-</td>
                    <td className="text-center p-4">✓</td>
                  </tr>
                  <tr>
                    <td className="p-4 text-foreground">Client Management Tools</td>
                    <td className="text-center p-4">-</td>
                    <td className="text-center p-4">-</td>
                    <td className="text-center p-4">✓</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-foreground text-center mb-8">
              Frequently Asked Questions
            </h2>
            <div className="max-w-3xl mx-auto">
              <div className="space-y-6">
                {faqs.map((faq, index) => (
                  <div key={index} className="card p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {faq.question}
                    </h3>
                    <p className="text-muted-foreground">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center">
            <div className="bg-primary rounded-2xl p-8 md:p-12">
              <h2 className="text-3xl font-bold text-primary-foreground mb-4">
                Ready to Get Started?
              </h2>
              <p className="text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
                Join thousands of property owners and brokers who trust FlatUp to connect with quality tenants.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/auth/signup" className="btn bg-background text-foreground hover:bg-background/90">
                  Start Free Trial
                </Link>
                <Link href="/contact" className="btn border border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10">
                  Contact Sales
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
