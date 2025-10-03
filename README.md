# LoadWheels - Transport & Logistics Platform

## Project Overview

LoadWheels is a comprehensive transport and logistics platform connecting customers with verified delivery partners. The platform offers truck booking, same-day delivery, and real-time tracking services.

## Features

- **Truck Booking**: Book various vehicle types for cargo transportation
- **Same-Day Delivery**: Express delivery service with multiple urgency levels
- **Real-Time Tracking**: Live GPS tracking with driver communication
- **Partner Network**: Verified delivery partners across multiple cities
- **Admin Dashboard**: Comprehensive management system for bookings and partners
- **Multi-User System**: Customer, driver, and admin user types

## Technologies Used

This project is built with:

- **Frontend**: React, TypeScript, Vite
- **UI Components**: shadcn-ui, Tailwind CSS
- **Backend**: Supabase (Database, Authentication, Storage)
- **Maps Integration**: MapmyIndia API
- **Real-time Features**: Supabase real-time subscriptions

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd load-wheel
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file with your Supabase and MapmyIndia credentials:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_MAPMYINDIA_API_KEY=your_mapmyindia_api_key
```

4. Start the development server:
```bash
npm run dev
```

## Database Setup

Run the SQL schema from `database/schema.sql` in your Supabase project to set up the required tables and policies.

## Project Structure

```
src/
├── components/          # Reusable UI components
├── pages/              # Page components
├── contexts/           # React contexts (Auth, etc.)
├── services/           # External service integrations
├── lib/                # Utility libraries
└── assets/             # Static assets
```

## Key Features

### User Types
- **Customers**: Book trucks and track deliveries
- **Drivers**: Receive booking requests and manage deliveries
- **Admins**: Manage partners, bookings, and platform operations

### Services
- **Regular Truck Booking**: Various vehicle sizes for different cargo needs
- **Same-Day Delivery**: Express service with 1-6 hour delivery windows
- **Real-Time Tracking**: Live location updates and driver communication

### Admin Features
- Partner application management
- Booking oversight and status updates
- Real-time communication with customers and drivers

## Deployment

The application can be deployed to any static hosting service that supports React applications:

- Vercel
- Netlify
- AWS S3 + CloudFront
- Firebase Hosting

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.