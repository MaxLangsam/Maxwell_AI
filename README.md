# Maxwell - AI Personal Assistant with Second Brain

Maxwell is a sophisticated AI personal assistant built with Next.js, Supabase, and OpenAI. It features advanced Second Brain capabilities including thought pattern recognition, semantic search, and intelligent insights.

## Features

### 🧠 Second Brain Capabilities
- **Semantic Embeddings**: Vector-based thought connections
- **Pattern Recognition**: Detect recurring themes and concerns
- **Thought Clustering**: Group related ideas across time
- **Insight Generation**: Surface forgotten ideas and suggest connections
- **Weekly Thought Digest**: Comprehensive analysis of thinking patterns

### 💬 Chat & Sessions
- **Persistent Chat Sessions**: Save and organize conversations
- **Session Tagging**: Categorize conversations by topic
- **Message History**: Full conversation persistence
- **Multi-session Management**: Switch between different chat contexts

### 📋 Productivity Features
- **Task Management**: Create, track, and complete tasks with priorities
- **Smart Reminders**: Time-based and recurring reminders
- **Note Taking**: Capture notes, journal entries, and ideas
- **Calendar Integration**: Schedule events and find free time

### 🔍 Intelligence Features
- **Natural Language Processing**: Understand intent and context
- **Memory System**: Remember user preferences and important information
- **Contextual Awareness**: Connect current conversations to past interactions
- **Mood Tracking**: Analyze sentiment trends over time

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Real-time)
- **AI**: OpenAI GPT-4o-mini, Text Embeddings
- **UI Components**: Radix UI, shadcn/ui
- **Vector Search**: pgvector (for semantic similarity)

## Getting Started

### Prerequisites

- Node.js 18+ 
- Supabase account
- OpenAI API key

### Installation

1. Clone the repository:
\`\`\`bash
git clone https://github.com/yourusername/maxwell-ai-assistant.git
cd maxwell-ai-assistant
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Set up environment variables:
\`\`\`bash
cp .env.example .env.local
\`\`\`

Fill in your Supabase and OpenAI credentials.

4. Set up Supabase:
   - Create a new Supabase project
   - Enable the `vector` extension in SQL Editor
   - Run the migration file: `supabase/migrations/20231201000001_create_complete_schema.sql`

5. Run the development server:
\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) to see Maxwell in action.

## Database Schema

The application uses a comprehensive PostgreSQL schema with the following main tables:

- `users` - User profiles and preferences
- `chat_sessions` - Chat session management
- `messages` - Individual chat messages
- `tasks` - Task management
- `notes` - Note-taking and journaling
- `reminders` - Time-based reminders
- `calendar_events` - Calendar and scheduling
- `memories` - Long-term memory storage
- `embeddings` - Vector embeddings for semantic search
- `insights` - Generated insights and patterns

## API Routes

### Authentication
- `GET/POST /api/auth/callback` - Supabase auth callback

### Chat & Sessions
- `GET/POST /api/sessions` - Manage chat sessions
- `PUT/DELETE /api/sessions/[id]` - Update/delete sessions
- `GET/POST /api/messages` - Chat message management

### Productivity
- `GET/POST /api/tasks` - Task management
- `PUT/DELETE /api/tasks/[id]` - Update/delete tasks
- `GET/POST /api/notes` - Note management
- `GET/POST /api/calendar` - Calendar events

### Intelligence
- `GET/POST /api/insights` - Insight generation
- `GET /api/insights/digest` - Weekly thought digest
- `GET /api/stats` - User statistics

## Second Brain Architecture

Maxwell's Second Brain system works through several layers:

1. **Input Processing**: All user interactions are converted to vector embeddings
2. **Pattern Detection**: Algorithms identify recurring themes and behaviors
3. **Memory Formation**: Important information is stored in long-term memory
4. **Insight Generation**: AI analyzes patterns to generate actionable insights
5. **Contextual Retrieval**: Related thoughts are surfaced during conversations

## Deployment

### Supabase Setup

1. Create a new Supabase project
2. Enable the `vector` extension:
\`\`\`sql
CREATE EXTENSION IF NOT EXISTS vector;
\`\`\`

3. Run the migration file to create all tables and policies
4. Set up authentication providers (email, Google, etc.)
5. Configure RLS policies for data security

### Vercel Deployment

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy with automatic builds on push

### Environment Variables

Required environment variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`

## Usage

### Getting Started with Maxwell

1. **Sign Up**: Create an account using email or social login
2. **Start Chatting**: Begin a conversation with Maxwell
3. **Add Tasks**: Use natural language to create tasks ("Remind me to call mom")
4. **Take Notes**: Capture thoughts and ideas
5. **Schedule Events**: "Schedule a meeting with John tomorrow at 2pm"
6. **Review Insights**: Check the insights panel for patterns and suggestions

### Natural Language Commands

Maxwell understands various natural language patterns:

- **Tasks**: "Add task: finish presentation", "🔥 urgent: submit report"
- **Reminders**: "Remind me to call mom at 3pm", "Set reminder for tomorrow"
- **Notes**: "Note: great idea for weekend project", "Journal: feeling productive today"
- **Calendar**: "Schedule meeting with team next Monday at 10am"
- **Memory**: "/forget about old project", "Remember that I prefer morning meetings"

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@maxwell-ai.com or join our Discord community.

## Roadmap

- [ ] Mobile app (React Native)
- [ ] Voice interactions
- [ ] Team collaboration features
- [ ] Advanced analytics dashboard
- [ ] Integration with external tools (Notion, Slack, etc.)
- [ ] Offline mode support
\`\`\`

Perfect! I've integrated a complete full-stack backend with Supabase for Maxwell. Here's what's been implemented:

## 🗄️ **Complete Database Schema**
- **10 Core Tables**: Users, chat sessions, messages, tasks, notes, reminders, calendar events, memories, embeddings, and insights
- **Vector Support**: pgvector extension for semantic embeddings
- **Row Level Security**: Complete RLS policies for data protection
- **Automatic Triggers**: Updated timestamps and user creation handling

## 🔐 **Authentication System**
- **Supabase Auth**: Email/password and social login support
- **Middleware**: Session management and route protection
- **Auth Provider**: React context for user state management
- **Auto User Creation**: Automatic user profile creation on signup

## 🚀 **Complete API Layer**
- **RESTful Endpoints**: Full CRUD operations for all entities
- **Type Safety**: Complete TypeScript types for database schema
- **Error Handling**: Proper error responses and validation
- **Security**: User-scoped data access with RLS

## 📊 **Advanced Features**
- **User Statistics**: Database function for analytics
- **Memory Cleanup**: Automatic expired memory cleanup
- **Insight Generation**: AI-powered pattern detection
- **Weekly Digests**: Comprehensive thought analysis

## 🛠️ **Production Ready**
- **Environment Configuration**: Complete .env setup
- **Deployment Scripts**: Ready for Vercel deployment
- **Database Migrations**: Structured SQL migrations
- **Documentation**: Comprehensive README with setup instructions

## 🔄 **Real-time Capabilities**
- **Live Updates**: Supabase real-time subscriptions ready
- **Session Sync**: Multi-device session synchronization
- **Collaborative Features**: Foundation for team features

The backend is now fully integrated and production-ready. Users can:
- Sign up and authenticate securely
- Have persistent chat sessions across devices
- Store and retrieve all their data (tasks, notes, calendar, etc.)
- Benefit from AI insights and pattern recognition
- Access their data through a type-safe API

All data is properly secured with Row Level Security, and the system scales automatically with Supabase's infrastructure. The Second Brain functionality now has persistent storage, making Maxwell a truly powerful personal AI assistant!
