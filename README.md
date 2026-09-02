# 🚗 Motorent

A modern full-stack vehicle rental platform built with Next.js, TypeScript, and PostgreSQL. Motorent connects vehicle owners with renters, offering a seamless experience for booking bikes and cars.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Setup](#environment-setup)
- [Running the Project](#running-the-project)
- [Database](#database)
- [Key Features Documentation](#key-features-documentation)
- [Project Architecture](#project-architecture)

## ✨ Features

### User Management
- **Multi-role Authentication**: Support for General Users, Vehicle Owners, and Admins
- **Google OAuth Integration**: Social login via Google
- **User Verification**: Document-based verification system with approval workflow
  - NID/Passport verification
  - Driving License verification
  - Ownership Papers for vehicle owners
  - Passport Photo validation

### Vehicle Management
- **Vehicle Listings**: Browse bikes and cars available for rent
- **Vehicle Categories**: Support for BIKE and CAR categories
- **Detailed Specifications**: 
  - Fuel type, transmission type
  - Seating capacity
  - Special features and amenities
  - Photo and documentation upload
- **Vehicle Status Tracking**: PENDING → APPROVED → ACTIVE workflow
- **Location-based Search**: Integrated with Leaflet maps for geographic discovery
- **View Analytics**: Track vehicle popularity with view counts

### Booking System
- **Flexible Pricing**: Daily, hourly, and weekly rates
- **Booking Management**: 
  - Request submission
  - Owner approval/rejection workflow
  - Booking status tracking (PENDING, ACCEPTED, REJECTED, COMPLETED, CANCELLED)
- **Rental Timeline**: 
  - Start/end dates
  - Pickup/dropoff locations
  - Pickup time scheduling
- **Damage & Late Fee Tracking**: Comprehensive cost management for rental returns
- **Real-time Location Tracking**: GPS coordinates for renter location during rental

### Communication
- **Booking Messages**: In-app messaging between renters and vehicle owners
- **Direct Messaging**: Private messaging system between users
- **Message Threading**: Contextual conversations linked to specific bookings

### Admin Features
- **Verification Review**: Approve/reject user and vehicle verification requests
- **Platform Moderation**: Manage user roles and permissions
- **Booking Oversight**: Monitor rental transactions

## 🛠 Tech Stack

### Frontend
- **Framework**: Next.js 16.1.6
- **Language**: TypeScript 5.7.3
- **UI Components**: Radix UI (comprehensive component library)
- **Styling**: Tailwind CSS 4.2.0
- **Form Management**: React Hook Form with Zod validation
- **Map Integration**: Leaflet with React Leaflet
- **Icons**: Lucide React
- **Animations**: Embla Carousel, Tailwind animations
- **Toast Notifications**: Sonner
- **Command Palette**: cmdk
- **Date Picking**: React Day Picker

### Backend
- **Runtime**: Node.js with TypeScript
- **ORM**: Prisma 6.17.1
- **Database**: PostgreSQL
- **Authentication**: Next-Auth 4.24.14, JWT
- **Password Security**: bcryptjs
- **Real-time Communication**: Pusher (WebSocket)
- **Email Service**: Nodemailer
- **File Upload**: UploadThing

### Development Tools
- **Linting**: ESLint
- **PostCSS**: For CSS preprocessing
- **TSX**: TypeScript execution for seed scripts

### Language Composition
- **TypeScript**: 98.1%
- **CSS**: 1.8%
- **JavaScript**: 0.1%

## 📁 Project Structure

```
Motorent/
├── app/                    # Next.js app directory
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Database seeding script
├── public/                # Static assets
├── src/                   # Source files (if using)
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
├── tailwind.config.js     # Tailwind CSS configuration
└── README.md              # This file
```

## 📋 Prerequisites

- Node.js 18.x or higher
- npm or yarn
- PostgreSQL database
- Pusher account (for real-time features)
- UploadThing account (for file uploads)
- Google OAuth credentials (for social login)
- Nodemailer configuration (for email services)

## 🚀 Installation

1. **Clone the repository**
```bash
git clone https://github.com/AsirMahmud/Motorent.git
cd Motorent
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
```

## 🔧 Environment Setup

Create a `.env.local` file in the root directory with the following variables:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/motorent

# Next-Auth
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# JWT
JWT_SECRET=your-jwt-secret

# Pusher (Real-time)
NEXT_PUBLIC_PUSHER_KEY=your-pusher-key
NEXT_PUBLIC_PUSHER_CLUSTER=your-cluster
PUSHER_SECRET=your-pusher-secret
PUSHER_ID=your-pusher-id

# UploadThing (File uploads)
UPLOADTHING_SECRET=your-uploadthing-secret
NEXT_PUBLIC_UPLOADTHING_APP_ID=your-app-id

# Email Service (Nodemailer)
SMTP_HOST=your-smtp-host
SMTP_PORT=587
SMTP_USER=your-email
SMTP_PASS=your-password
ADMIN_EMAIL=admin@motorent.com

# Analytics
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=your-analytics-id
```

## ▶️ Running the Project

### Development Mode
```bash
npm run dev
# or
yarn dev
```

Visit `http://localhost:3000` to see your application.

### Database Setup

1. **Generate Prisma Client**
```bash
npm run prisma:generate
```

2. **Create/Update Database Schema**
```bash
npm run prisma:push
# or for migrations
npm run prisma:migrate
```

3. **Seed Database** (optional)
```bash
npm run prisma:seed
```

### Production Build
```bash
npm run build
npm run start
```

### Linting
```bash
npm run lint
```

## 🗄 Database

### Schema Overview

The database consists of the following core models:

#### **User**
- Authentication and profile management
- Role-based access (GENERAL, OWNER, ADMIN)
- Verification status tracking
- Document storage (NID, License, Ownership Papers, Photos)

#### **Vehicle**
- Vehicle listings with detailed specs
- Owner relationship
- Category (BIKE/CAR)
- Pricing (daily, hourly, weekly)
- Status workflow (PENDING → APPROVED → ACTIVE)
- Map coordinates for location-based search
- Photo and documentation URLs

#### **Booking**
- Rental transactions between users and vehicles
- Status management (PENDING → ACCEPTED → COMPLETED)
- Date/time management
- Location tracking (pickup/dropoff, GPS)
- Cost tracking (daily rate, late fees, damage fees)
- Payment status

#### **Message**
- Booking-specific messaging
- Conversation threading

#### **DirectMessage**
- Private user-to-user messaging
- Read status tracking

## 🎯 Key Features Documentation

### Authentication Flow
1. Users can sign up with email/password or Google OAuth
2. Email verification via JWT tokens sent through Nodemailer
3. Password hashing with bcryptjs for security
4. Session management via NextAuth

### Vehicle Listing & Search
1. Owners can list vehicles with comprehensive details
2. Users can explore vehicles on an interactive Leaflet map
3. Filter by category (BIKE/CAR) and location
4. View counts track popular listings

### Booking Workflow
```
User Initiates Booking
        ↓
Owner Reviews Request
        ↓
Accept/Reject Decision
        ↓
If Accepted:
  - Pickup scheduled
  - Renter location tracked
  - Return processing with damage/late fees
        ↓
Booking Completed
```

### Real-time Features
- **Pusher Integration**: Live notifications for booking updates, messages
- **GPS Tracking**: Real-time renter location during active rentals
- **Message Push**: Instant message delivery notifications

### File Upload
- **UploadThing**: Handles vehicle photos, documents, and verification files
- **Secure Storage**: All files stored in cloud with proper access control

## 🏗 Project Architecture

### Full-Stack TypeScript
The entire project is built with TypeScript (98.1% of codebase), ensuring:
- Type safety across frontend and backend
- Better IDE support and autocompletion
- Fewer runtime errors
- Improved maintainability

### Component-Based UI
- Radix UI provides unstyled, accessible components
- Tailwind CSS handles all styling
- Form components with React Hook Form
- Validation with Zod schema

### Database-First Design
- Prisma ORM for type-safe database access
- PostgreSQL for reliable data management
- Automatic migrations
- Built-in relation management

### Real-time Communication
- Pusher for WebSocket connections
- Live messaging and notifications
- GPS coordinate updates

## 📝 Scripts Reference

```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint
npm run prisma:generate # Generate Prisma client
npm run prisma:migrate  # Run database migrations
npm run prisma:push     # Push schema to database
npm run prisma:seed     # Seed database with initial data
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Author

**Asir Mahmud**
- GitHub: [@AsirMahmud](https://github.com/AsirMahmud)

## 🆘 Support

If you encounter any issues or have questions, please open an issue on the GitHub repository.

---

**Last Updated**: September 2, 2026
**Repository**: [AsirMahmud/Motorent](https://github.com/AsirMahmud/Motorent)
