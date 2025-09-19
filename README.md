<div align="center">

![Character Logo](./public/character-logo.svg)
![Lutong BahAI Logo](./public/txtlogo.svg)

</div>

**Your AI Filipino Recipe Buddy** - An intelligent conversational web application that helps users discover and generate authentic Filipino recipes based on their available ingredients, dietary preferences, and cooking experience.

## What It Does

Lutong BahAI is an AI-powered Filipino recipe assistant that provides a personalized cooking experience through:

### Intelligent Chat Interface
- Conversational AI that understands your cooking preferences, available ingredients, and dietary restrictions
- Smart recipe recommendations based on authentic Filipino cuisine
- Context-aware conversations that remember your preferences throughout the session
- Multiple chat sessions with automatic saving and retrieval

### Recipe Generation & Management
- AI-generated authentic Filipino recipes with detailed instructions
- Recipe collection with search functionality by ingredients, dish names, or categories
- Automatic recipe image generation using AI
- Recipe saving and management with local storage
- Detailed recipe cards with cooking time, difficulty level, servings, and tips

### Cooking Timer
- Built-in cooking timer with audio notifications
- Customizable timer for different cooking steps
- Visual and audio alerts when cooking time is complete

### Local Data Storage
- All data stored locally using IndexedDB for privacy
- No server-side user data storage
- Persistent chat history and recipe collections
- Offline-capable recipe viewing

### Modern User Experience
- Responsive design that works on desktop and mobile devices
- Smooth animations and transitions
- Intuitive navigation between chat, recipes, and recipe details

## Tech Stack

### Frontend Framework
- **Next.js 14.2.16** - React-based full-stack framework with App Router
- **React 18** - Component-based UI library
- **TypeScript 5** - Type-safe development

### UI Components & Styling
- **Tailwind CSS 4.1.9** - Utility-first CSS framework
- **shadcn/ui** - Modern component system built on Radix UI and Tailwind CSS
- **Radix UI** - Accessible, unstyled UI primitives
  - Dialog, Dropdown, Toast, Accordion, and 20+ other components
- **Lucide React** - Modern icon library
- **class-variance-authority** - Component variant management
- **tailwindcss-animate** - Animation utilities

### AI Integration
- **Google Generative AI (Gemini)** - Conversational AI and recipe generation
  - Gemini 2.5 Flash Lite for chat responses and recipe generation
  - Gemini 2.0 Flash Preview Image Generation for recipe image generation
- **Custom AI prompts** for authentic Filipino cuisine knowledge

### Data Storage
- **IndexedDB** - Client-side database for recipes, chat history, and user data
- **Custom storage layer** with TypeScript interfaces
- **Local-first architecture** - no external database dependencies

### Form Handling & Validation
- **React Hook Form 7.60.0** - Performant form library
- **Zod 3.25.67** - Schema validation
- **@hookform/resolvers** - Form validation integration

### Additional Features
- **Sonner** - Toast notifications
- **date-fns** - Date manipulation utilities
- **Embla Carousel** - Touch-friendly carousels
- **React Resizable Panels** - Resizable layout components
- **next-themes** - Theme switching support

### Development Tools
- **PostCSS 8.5** - CSS processing
- **Autoprefixer** - CSS vendor prefixes
- **ESLint** - Code linting
- **Geist Font** - Modern typography

### API Architecture
- **Next.js API Routes** - Serverless backend functions
- **RESTful endpoints** for chat, recipe generation, and image creation
- **Error handling** with fallback responses
- **Rate limiting** for AI API calls

## Key Features

### Authentic Filipino Cuisine Focus
- Specialized knowledge of Filipino ingredients and cooking techniques
- Traditional recipe variations and regional differences
- Cultural context and cooking tips for authentic flavors

### Privacy-First Design
- All personal data stored locally on user's device
- No user tracking or data collection
- Secure API communication with Google's Gemini AI

### Progressive Web App Ready
- Responsive design for all screen sizes
- Touch-friendly interface for mobile cooking
- Fast loading with optimized assets

### Smart Recipe Matching
- Ingredient-based recipe suggestions
- Dietary restriction accommodation
- Skill level appropriate recommendations
- Seasonal and available ingredient considerations

This application combines modern web technologies with AI capabilities to create an intuitive, educational, and practical cooking assistant specifically tailored for Filipino cuisine enthusiasts.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.