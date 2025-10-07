# Overflow - Enterprise Notes & Todo Application

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-green)](./LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](./CONTRIBUTING.md)

A modern, enterprise-grade notes and todo application built with Next.js 14, featuring voice transcription, OCR text extraction, real-time collaboration, and offline support.

## ✨ Features

### Core Features
- 📝 **Multiple Note Types**: Text, checklists, drawings, images, and audio recordings
- 🎨 **Rich Drawing Canvas**: Full-featured drawing tools with Konva integration
- 🎤 **Voice Recording**: Record audio with automatic transcription
- 📸 **OCR Support**: Extract text from images using Tesseract.js
- 🏷️ **Labels & Organization**: Color coding, labels, and custom organization
- 📌 **Pin & Archive**: Keep important notes accessible
- 🔍 **Advanced Search**: Comprehensive filtering and full-text search
- 📤 **Export Options**: Export to PDF, DOCX, HTML, CSV, JSON, and ZIP

### Collaboration
- 👥 **Real-time Collaboration**: Work together with live updates
- 🔗 **Share Links**: Generate secure sharing links with permissions
- 👀 **Presence Indicators**: See who's viewing and editing
- 📊 **Activity Tracking**: Complete audit log of all changes
- 🔐 **Permission Management**: Fine-grained access control (view, edit, admin)

### Advanced Features
- 🌙 **Dark Mode**: Beautiful dark theme support
- 📱 **PWA Support**: Install as a native app
- 🔄 **Offline Sync**: Work without internet connection
- ⚡ **Real-time Updates**: Instant synchronization using Supabase
- 🎯 **Reminders**: Set date-based and location-based reminders
- ♿ **Accessible**: WCAG 2.1 AA compliant
- 🔒 **Secure**: Enterprise-grade security with RLS policies

## 🚀 Quick Start

### Prerequisites
- Node.js 18.x or higher
- npm, yarn, or pnpm
- Supabase account (for backend)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/overflow.git
cd overflow
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here
```

4. **Set up the database**
```bash
# Apply migrations in Supabase SQL Editor
# Run the SQL script from: supabase/migrations/001_initial_schema.sql
```

5. **Run the development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your app.

## 📁 Project Structure

```
overflow/
├── app/                      # Next.js App Router
│   ├── layout.tsx           # Root layout with providers
│   ├── page.tsx             # Home page
│   ├── error.tsx            # Error handling
│   ├── loading.tsx          # Loading states
│   └── globals.css          # Global styles
├── components/              # React components
│   ├── audio/              # Audio recording components
│   ├── collaboration/      # Collaboration features
│   ├── drawing/            # Drawing canvas
│   ├── export/             # Export functionality
│   ├── labels/             # Label management
│   ├── layout/             # Layout components
│   ├── notes/              # Note components
│   ├── ocr/                # OCR processing
│   ├── search/             # Search functionality
│   ├── settings/           # Settings
│   └── ui/                 # UI primitives
├── hooks/                   # Custom React hooks
├── lib/                     # Utilities and configs
│   ├── supabase.ts         # Supabase client
│   ├── env.ts              # Environment validation
│   └── utils.ts            # Helper functions
├── types/                   # TypeScript types
├── supabase/               # Database migrations
│   └── migrations/
└── public/                 # Static assets
    ├── manifest.json       # PWA manifest
    └── icons/              # App icons
```

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5.5
- **Styling**: Tailwind CSS 3.4
- **UI Components**: Radix UI
- **Animations**: Framer Motion
- **State Management**: TanStack Query
- **Forms**: React Hook Form + Zod

### Backend & Database
- **Backend**: Supabase
- **Database**: PostgreSQL
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **Real-time**: Supabase Realtime

### Features
- **Drawing**: Konva & React-Konva
- **OCR**: Tesseract.js
- **Audio**: MediaRecorder API
- **Offline**: Dexie.js (IndexedDB)
- **PWA**: next-pwa
- **Export**: jsPDF, html2canvas

## 🔐 Security

- **Authentication**: Supabase Auth with JWT
- **Authorization**: Row Level Security (RLS) policies
- **Data Protection**: Encryption for sensitive data
- **Input Validation**: Zod schema validation
- **XSS Protection**: Content sanitization
- **CSRF Protection**: Built-in Next.js protections
- **Rate Limiting**: API rate limiting
- **Security Headers**: CSP, HSTS, X-Frame-Options, etc.

## 🚢 Deployment

### Vercel (Recommended)

1. **Connect your repository to Vercel**
2. **Configure environment variables** in Vercel dashboard
3. **Deploy**: Automatic deployments on push to main

```bash
npm run build
```

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Supabase](https://supabase.com/) - Backend infrastructure
- [Radix UI](https://www.radix-ui.com/) - UI components
- [Tailwind CSS](https://tailwindcss.com/) - Styling

---

Made with ❤️ by the Overflow Team
