# Overview

This is an AI-powered heat shelter finder application built for helping people locate cooling centers during extreme heat conditions. The app provides real-time recommendations for nearby shelters with information about capacity, amenities, and occupancy levels. It's specifically designed for Korean users, featuring a bilingual interface with Korean language support.

The application combines interactive mapping with AI-driven recommendations to help users find the most suitable cooling shelters based on their location, preferences, and current conditions. Users can view shelters on an interactive map, get personalized AI recommendations, and manage favorite locations.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **UI Framework**: Tailwind CSS with shadcn/ui component library for consistent design
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Mapping**: Leaflet for interactive maps with custom markers and clustering
- **Form Handling**: React Hook Form with Zod for validation

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **API Pattern**: RESTful API with organized route handlers
- **Data Layer**: In-memory storage implementation with interface for future database integration
- **Build System**: ESBuild for production bundling with TypeScript compilation

## Data Storage Solutions
- **Database**: PostgreSQL configured with Drizzle ORM
- **Schema**: Well-defined tables for shelters, weather data, and user favorites
- **Connection**: Neon Database serverless PostgreSQL for production
- **Development**: In-memory storage implementation for rapid prototyping

## Authentication and Authorization
- **Current State**: Mock user system with hardcoded user IDs
- **Future Ready**: Schema includes user-related tables for implementing proper authentication
- **Session Management**: Connect-pg-simple configured for PostgreSQL session storage

## External Dependencies
- **Database**: Neon Database (PostgreSQL serverless)
- **Geolocation**: Browser Geolocation API for user positioning
- **Maps**: Leaflet with OpenStreetMap tiles
- **Fonts**: Google Fonts (Inter) for typography
- **Icons**: Font Awesome and Lucide React for iconography
- **Deployment**: Replit-optimized with development banner integration

## Key Design Patterns
- **Component Architecture**: Modular React components with clear separation of concerns
- **Data Fetching**: Server state management with React Query for caching and synchronization
- **Type Safety**: Full TypeScript implementation with shared types between client and server
- **Responsive Design**: Mobile-first approach with Tailwind CSS breakpoints
- **Error Handling**: Graceful error boundaries and user-friendly error messages
- **Accessibility**: ARIA labels and semantic HTML structure throughout

## API Structure
- **Shelters**: CRUD operations with distance calculations and filtering
- **Recommendations**: AI-powered shelter suggestions based on user location and preferences
- **Weather**: Real-time weather data integration for heat advisories
- **Favorites**: User preference management for bookmarked shelters
- **Geospatial**: Location-based queries with distance calculations

The architecture supports scalability with clear separation between presentation, business logic, and data layers, making it easy to extend features and integrate additional services.