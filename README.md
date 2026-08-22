PROJECT TILTLE :  Farmers Direct Produce Marketplace Portal 

PROPOSAL :

         FarmLink Direct is a digital marketplace that empowers small farmers to list their fresh produce directly for local buyers, eliminating exploitative intermediaries. The portal enables buyers to search and filter listings by type and location, ensuring fair pricing and supply chain transparency. Through integrated order/inquiry features, buyers can directly connect with farmers, while farmers retain full control to update or remove listings as inventory changes. This solution boosts farmer incomes, reduces food waste, and provides communities with access to fresher, locally-sourced produce.

┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                  │
│  ┌───────────────┐    ┌───────────────┐    ┌───────────────────────────┐  │
│  │   Web Browser  │    │  Mobile Web   │    │   Admin Dashboard         │  │
│  │  (React SPA)   │    │  (Responsive) │    │   (React + Bootstrap)     │  │
│  └───────┬───────┘    └───────┬───────┘    └─────────────┬─────────────┘  │
└──────────┼────────────────────┼────────────────────────────┼───────────────┘
           │ HTTPS / REST APIs  │                            │
           ▼                    ▼                            ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           APPLICATION LAYER                                │
│                          (Django / Node.js)                                 │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         API GATEWAY                                 │   │
│  │  (Authentication, Rate Limiting, Request Routing)                   │   │
│  └───────────────────────────┬─────────────────────────────────────────┘   │
│                               │                                             │
│  ┌────────────────────────────┴─────────────────────────────────────────┐  │
│  │                      BUSINESS LOGIC (MVC)                            │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │  │
│  │  │ User Service │  │ Listing      │  │ Order/Inquiry Service    │  │  │
│  │  │ (Auth/RBAC)  │  │ Service      │  │ (CRUD, Status Tracking) │  │  │
│  │  └──────────────┘  └──────────────┘  └──────────────────────────┘  │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │  │
│  │  │ Search       │  │ Geolocation  │  │ Notification Service     │  │  │
│  │  │ Service      │  │ Service      │  │ (Email/SMS/Push)         │  │  │
│  │  └──────────────┘  └──────────────┘  └──────────────────────────┘  │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────┬──────────────────────────────────────────┘
                                   │
           ┌───────────────────────┼───────────────────────┐
           ▼                       ▼                       ▼
┌──────────────────┐  ┌─────────────────────┐  ┌────────────────────────┐
│   DATABASE       │  │   CACHE LAYER       │  │   FILE STORAGE         │
│   LAYER          │  │   (Redis)           │  │   (AWS S3)             │
│                  │  │                     │  │                         │
│ ┌──────────────┐ │  │  ┌───────────────┐  │  │  ┌───────────────────┐ │
│ │ PostgreSQL   │ │  │  │ Session Store │  │  │  │ Produce Images    │ │
│ │ + PostGIS    │ │  │  │ Search Cache  │  │  │  │ Farmer Profiles   │ │
│ │ (Geo-spatial)│ │  │  │ Rate Limiting │  │  │  │                   │ │
│ └──────────────┘ │  │  └───────────────┘  │  │  └───────────────────┘ │
└──────────────────┘  └─────────────────────┘  └────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        EXTERNAL INTEGRATIONS                                │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────────────────────┐ │
│  │  Google Maps   │  │  Twilio/SendGrid│  │  Payment Gateway (Future)   │ │
│  │  API (Maps/Geo)│  │  (Notifications)│  │  (Razorpay/Stripe)           │ │
│  └────────────────┘  └────────────────┘  └──────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
 
Technology Stack :
React.js – Frontend
HTML – Webpage structure
CSS – Styling
Bootstrap – Responsive design
JavaScript – Frontend functionality
Node.js – Backend runtime
Express.js – Backend framework
MySQL – Database
REST API – Frontend–backend communication

TEAM MEMBERS:
ANUSOUNDHARYA K - 73152413012
DHARANIKANTH M - 73152413042

