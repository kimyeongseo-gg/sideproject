# Overview

This is a real-time posture correction web application built with modern web technologies. The application uses AI-powered computer vision to detect and prevent poor posture habits like "turtle neck" positioning and nail-biting behaviors through webcam monitoring. It provides real-time feedback, statistics tracking, and customizable detection settings to help users maintain better posture and break harmful habits.

The application features a modern, responsive UI with dark/light theme support, real-time pose detection using TensorFlow.js and PoseNet, user session management, and comprehensive settings for customizing detection sensitivity and notification preferences.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern component patterns
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management and caching
- **UI Components**: Radix UI primitives with shadcn/ui component system for consistent, accessible design
- **Styling**: Tailwind CSS with CSS variables for theming and glassmorphism effects
- **Build Tool**: Vite for fast development and optimized production builds

## Backend Architecture
- **Runtime**: Node.js with Express.js server framework
- **Language**: TypeScript for full-stack type safety
- **API Design**: RESTful API endpoints for session management and user settings
- **Data Storage**: In-memory storage with interface abstraction for future database integration
- **Development**: Hot module replacement with Vite middleware integration

## AI/Computer Vision System
- **ML Framework**: TensorFlow.js for client-side machine learning
- **Pose Detection**: PoseNet model for real-time human pose estimation
- **Analysis Engine**: Custom posture analysis algorithms for detecting turtle neck posture and nail-biting behaviors
- **Webcam Integration**: MediaStream API for camera access with device switching capabilities

## Data Management
- **Schema**: Drizzle ORM with PostgreSQL schema definitions for type-safe database operations
- **Storage Interface**: Abstracted storage layer with in-memory implementation (ready for PostgreSQL integration)
- **Session Tracking**: Real-time posture session management with statistics collection
- **Settings Management**: Persistent user preferences for detection sensitivity and notifications

## Real-time Detection System
- **Pose Analysis**: Real-time keypoint detection and geometric calculations for posture assessment
- **Sensitivity Controls**: Configurable thresholds for turtle neck angle detection and hand-to-face proximity
- **Notification System**: Visual and audio alerts with customizable frequency settings
- **Statistics Tracking**: Session-based metrics including good posture time, warning counts, and streaks

# External Dependencies

## Core Framework Dependencies
- **React Ecosystem**: React 18, React DOM, React Query for modern React development
- **TypeScript**: Full TypeScript support across frontend and backend
- **Vite**: Development server and build tool with HMR support

## UI and Styling
- **Radix UI**: Comprehensive set of accessible React primitives for buttons, dialogs, switches, etc.
- **Tailwind CSS**: Utility-first CSS framework with PostCSS processing
- **Lucide React**: Icon library for consistent iconography
- **shadcn/ui**: Pre-built component system built on Radix UI and Tailwind

## AI and Computer Vision
- **TensorFlow.js**: Machine learning library for browser-based AI
- **PoseNet Model**: Pre-trained pose estimation model for human keypoint detection
- **MediaStream API**: Browser API for webcam access and video processing

## Backend and Database
- **Express.js**: Web application framework for Node.js
- **Drizzle ORM**: Type-safe database ORM with PostgreSQL support
- **Neon Database**: PostgreSQL-compatible serverless database (configured but not actively used in current implementation)
- **Zod**: Schema validation library for API endpoints and data validation

## Development Tools
- **ESBuild**: Fast JavaScript bundler for production builds
- **tsx**: TypeScript execution environment for development
- **Replit Integration**: Development environment integration with error overlays and cartographer