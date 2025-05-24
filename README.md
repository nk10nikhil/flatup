# FlatUp - Feature-Rich Flat Listing Web Application

A comprehensive full-stack web platform that connects people looking for places to live with flat owners, brokers, or current residents who have spare rooms. Built with Next.js 14, MongoDB Atlas, and modern web technologies.

## 🚀 Features

### 👥 User Roles & Functionalities

#### 🧍‍♂️ Listers (Paid Users)
- **Broker** (₹1000/month): Registered broker managing multiple properties
- **Owner** (₹800/month): Property owner renting directly
- **Room Sharer** (₹500/month): Individual renting spare rooms

**Lister Features:**
- Full user registration with profile photos
- Secure online payment via Razorpay
- Role-based personal dashboard
- Comprehensive flat listing with multiple images
- Listing analytics (views, inquiries)
- Subscription management and renewal
- Payment history and invoices

#### 🌐 General Users (Visitors)
- Browse listings without registration
- Advanced filtering and search
- Grid and list layout toggle
- Detailed flat information with image carousel
- Contact listers directly
- Share listings on social media

#### 🛡️ Super Admin
- Complete platform oversight
- User and listing management
- Real-time analytics dashboard
- Revenue tracking
- Subscription management
- Broadcasting and notifications

### 💳 Payment Integration
- Razorpay integration for INR payments
- Monthly subscription billing
- Secure checkout flow
- Webhook integration for payment verification
- Automated invoice generation
- Email notifications

### 🎨 UI/UX Features
- Modern, responsive design with Tailwind CSS
- Dark/light theme toggle
- Smooth animations with Framer Motion
- Mobile-first responsive design
- Elegant color palette and typography

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **Styling**: Tailwind CSS, Custom CSS Variables
- **Backend**: Next.js API Routes, MongoDB with Mongoose
- **Authentication**: NextAuth.js with Google OAuth & Credentials
- **Payment**: Razorpay
- **Image Upload**: Cloudinary
- **Email**: Nodemailer
- **Real-time**: Socket.IO/Pusher (configured)
- **Deployment**: Vercel-ready

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+ and npm
- MongoDB Atlas account
- Cloudinary account
- Razorpay account
- Google OAuth credentials
- Email service (Gmail recommended)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd flatup
npm install
```

### 2. Environment Variables
Create a `.env.local` file in the root directory and add the following:

```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster0.mongodb.net/flatup?retryWrites=true&w=majority

# NextAuth.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-key-here-change-this-in-production

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Razorpay
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# Email (Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-api-key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Service Setup

#### MongoDB Atlas
1. Create a MongoDB Atlas account
2. Create a new cluster
3. Create a database user
4. Get your connection string
5. Replace the MONGODB_URI in .env.local

#### Cloudinary
1. Sign up for Cloudinary
2. Get your cloud name, API key, and API secret
3. Add them to .env.local

#### Razorpay
1. Create a Razorpay account
2. Get your Key ID and Key Secret from the dashboard
3. Add them to .env.local

#### Google OAuth
1. Go to Google Cloud Console
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
6. Add credentials to .env.local

#### Email Setup (Gmail)
1. Enable 2-factor authentication on your Gmail account
2. Generate an app password
3. Use your Gmail and app password in .env.local

### 4. Run the Application
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 🗂️ Project Structure

```
src/
├── app/                    # Next.js 14 App Router
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # User dashboard
│   ├── admin/             # Admin dashboard
│   ├── browse/            # Browse listings
│   ├── flat/              # Flat details
│   ├── payment/           # Payment pages
│   └── pricing/           # Pricing page
├── components/            # Reusable components
│   ├── layout/           # Layout components
│   └── ui/               # UI components
├── lib/                  # Utility functions
├── models/               # MongoDB models
└── types/                # TypeScript types
```

## 🔐 Authentication Flow

1. User registers with role selection
2. Email verification (optional)
3. Redirect to payment page for subscription
4. Payment processing via Razorpay
5. Account activation and dashboard access

## 💰 Subscription Plans

| Plan | Price | Features |
|------|-------|----------|
| Room Sharer | ₹500/month | Basic listing, 5 photos, email support |
| Property Owner | ₹800/month | Unlimited listings, 10 photos, priority support |
| Broker | ₹1000/month | Premium features, 15 photos, client management |

## 🚀 Deployment

### Vercel Deployment
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Environment Variables for Production
Update the following for production:
- `NEXTAUTH_URL`: Your production domain
- `NEXT_PUBLIC_APP_URL`: Your production domain
- `NEXTAUTH_SECRET`: Generate a new secret for production

## 🧪 Testing

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 📱 Features Implemented

✅ User authentication with NextAuth.js
✅ Role-based access control
✅ Payment integration with Razorpay
✅ Image upload with Cloudinary
✅ Responsive design with Tailwind CSS
✅ Dark/light theme toggle
✅ Advanced filtering and search
✅ Real-time analytics dashboard
✅ Email notifications
✅ Admin panel with full control
✅ Mobile-responsive design
✅ SEO optimization

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, email support@flatup.com or create an issue in the repository.

---

Built with ❤️ using Next.js 14, MongoDB, and modern web technologies.
