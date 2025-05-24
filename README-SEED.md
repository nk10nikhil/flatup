# FlatUp - Seed Database

This document explains how to seed the database with sample data to test the public listing functionality.

## Prerequisites

1. Make sure MongoDB is running (either locally or MongoDB Atlas)
2. Set up your environment variables in `.env.local`

## Running the Seed Script

To populate the database with sample flats and users, run:

```bash
# Install dependencies if not already done
npm install

# Run the seed script
node scripts/seed-flats.js
```

## What the Seed Script Creates

### Sample Users
- **rajesh@example.com** (Owner) - password: `password123`
- **priya@example.com** (Broker) - password: `password123`  
- **amit@example.com** (Room Sharer) - password: `password123`

### Sample Flats
1. **Modern 2BHK Apartment in Bandra West** - ₹45,000/month (Featured)
2. **Spacious PG for Working Professionals in Koramangala** - ₹15,000/month
3. **Luxury 3BHK Villa in Cyber City, Gurgaon** - ₹65,000/month (Featured)
4. **Affordable 1BHK in Andheri East** - ₹25,000/month
5. **Shared Room in HSR Layout, Bangalore** - ₹12,000/month

## Testing Public Access

After running the seed script, you can test the public functionality:

1. **Homepage** (`http://localhost:3000`)
   - View featured flats without logging in
   - Use the search functionality

2. **Browse Page** (`http://localhost:3000/browse`)
   - See all active listings
   - Filter by city, type, price, etc.
   - Switch between grid and list views

3. **Flat Details** (`http://localhost:3000/flat/[id]`)
   - View complete flat information
   - Send inquiries without logging in
   - See lister contact information

4. **Send Inquiries**
   - Click "Show Interest" on any flat detail page
   - Fill out the inquiry form (no login required)
   - Inquiries are sent to the property lister

## Admin Access

- **URL**: `http://localhost:3000/admin`
- **Email**: `nk10nikhil@gmail.com`
- **Password**: `nk10nikhil`

## User Dashboard Access

Login with any of the sample users to access:
- Dashboard overview
- My listings management
- Analytics
- Inquiries received
- Subscription management
- Settings

## Key Features Verified

✅ **Public Browsing** - Anyone can view all flats without registration
✅ **Public Inquiries** - Anyone can send inquiries without registration  
✅ **Search & Filter** - Full search functionality works publicly
✅ **Responsive Design** - Works on mobile and desktop
✅ **Real-time Data** - All data comes from the database
✅ **Admin Management** - Full admin control over users and flats
✅ **User Dashboards** - Complete user management system

The application now fully supports public viewing of all flats while maintaining secure user-specific features for registered users.
