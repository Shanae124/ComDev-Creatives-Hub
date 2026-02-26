# ComDev Creatives Hub

A collaborative learning platform for the **Community Development Department** focused on teaching social media marketing and Cricut design skills through hands-on, project-based learning.

## 🎯 Purpose

This platform moves away from traditional PowerPoint presentations to create an engaging, practical learning experience where students:
- Create real Cricut designs
- Build social media content portfolios
- Share work with peers for feedback
- Develop marketing strategies through practice

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+

### Installation

1. **Install dependencies**
```bash
npm install
```

2. **Set up environment**
```bash
cp .env.example .env
# Edit .env with your database credentials
```

3. **Initialize database**
```bash
npm run init-db
```

4. **Start development server**
```bash
npm run dev
```

Visit: http://localhost:3000

## 📁 Project Structure

```
comdev-creatives-hub/
├── server.js              # Express API server
├── database/              # Database schemas & queries
├── routes/                # API endpoints
├── middleware/            # Auth & validation
├── app/                   # Next.js frontend
├── components/            # React components
├── uploads/               # Student design submissions
└── scripts/               # Setup & utilities
```

## ✨ Key Features

- **Project-Based Learning**: No slides, just hands-on assignments
- **Design Submissions**: Upload Cricut designs, photos, videos
- **Discussion Forums**: Peer feedback and collaboration
- **Content Calendar**: Plan and track social media posts
- **Portfolio Builder**: Showcase student work
- **Progress Tracking**: Monitor learning journey

## 🎨 Customization

Update branding in:
- `tailwind.config.js` - Colors
- `.env` - Organization name and tagline
- `app/layout.tsx` - Logo and header

## 📚 Course Structure

Designed for:
- Module-based learning
- Weekly hands-on projects
- Real-world applications
- Peer collaboration
- Portfolio development

## 🔒 Authentication

No default credentials are seeded. Create accounts through the registration flow.

## 📝 License

MIT - Community Development Department
