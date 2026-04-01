# KPI Dashboard - Client Data Tracking System

A comprehensive dashboard for tracking client performance across multiple platforms including social media, website SEO, ads, email marketing, and team performance.

## Features

- 📊 **7 Complete Tabs** for all KPI tracking
- 📱 **Responsive Design** with Material-UI
- 📈 **Interactive Charts** with Recharts
- 🔍 **Advanced Filtering** by date, client, and team member
- 📅 **Date Range Selection** for all tabs
- 👥 **Team Member Management**
- 🏢 **Client Management**
- 📝 **CRUD Operations** for all data types
- 🔐 **Authentication System**
- 🗄️ **PostgreSQL Database** with Neon
- 📱 **Progressive Web App** ready

## Tabs Overview

1. **Social Media** - Track 5 platforms (Reddit, TikTok, Instagram, Facebook, YouTube)
2. **Website / SEO** - 9 KPI terms including DA, PA, backlinks
3. **ADS / Closings / GHL** - Facebook ADS, Google ADS, Go High Level, Closings
4. **Email Marketing** - Template quality, emails sent, opening ratio
5. **Client Responses** - Reviews and miscellaneous work
6. **Team** - Task assignment, completion, quality scores
7. **Overview** - Consolidated view of all KPIs

## Live Demo

View the live dashboard at: [https://kpi-dashboard-olive.vercel.app/](https://kpi-dashboard-olive.vercel.app/)

### Viewer Credentials
- Username: `viewer.github`
- Password: `git.view@123`

## Tech Stack

### Frontend
- React 18
- Material-UI v5
- Recharts for data visualization
- Axios for API calls
- React Router v6
- Context API for state management

### Backend
- Node.js with Express
- PostgreSQL with Neon
- RESTful API architecture
- CORS enabled

### Database
- PostgreSQL on Neon
- UUID primary keys
- Comprehensive schema with relationships

## Installation

### Prerequisites
- Node.js 16+
- npm or yarn
- Neon PostgreSQL account

### Setup Steps

1. **Clone the repository**
```bash
git clone <repository-url>
cd kpi-dashboard