# ReviewDaddy

ReviewDaddy is an AI-powered app review analysis tool that helps developers and product teams understand user sentiment and discover actionable insights from their app reviews.

## Features

- 🤖 **AI-Powered Analysis**: Understand the emotional tone of your reviews with advanced sentiment analysis
- 📊 **Analytics Dashboard**: Track sentiment trends and visualize patterns in your reviews over time
- 🔍 **Smart Filtering**: Create custom filters to match specific keywords and criteria
- 📱 **Google Play Store Integration**: Automatically fetch and analyze reviews from your Android apps
- 🔄 **Real-time Updates**: Continuously monitor and analyze new reviews as they come in
- 🎯 **Issue Detection**: Automatically categorize common issues and feature requests

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL (Supabase)
- Google Play Store Developer Account (for app integration)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/reviewdaddy.git
cd reviewdaddy
```

2. Install dependencies:

```bash
npm install
```

3. Set up your environment variables:

```bash
cp .env.example .env.local
```

Required environment variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

4. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Tech Stack

- **Frontend**: Next.js 14+, React 19, Tailwind CSS
- **Backend**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Analytics**: Recharts
- **UI Components**: Radix UI, shadcn/ui
- **Animations**: Framer Motion
- **API Integration**: Google Play Store Scraper

## Project Structure

- `/app` - Next.js app router pages and components
- `/components` - Reusable UI components
- `/lib` - Utility functions and shared logic
- `/public` - Static assets
- `/types` - TypeScript type definitions

## Contributing

We welcome contributions! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please open an issue in the GitHub repository or contact our team at support@reviewdaddy.com
