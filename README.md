

# Maxwell AI (Description)

Maxwell AI is a personalized conversational assistant designed to enhance productivity, support daily reflection, and intelligently manage information. Built using OpenAI’s language models and the ChatbotSDK, and deployed via Vercel’s v0.dev platform, Maxwell AI serves as a dynamic second brain—capable of remembering user inputs, generating contextual responses, and offering insights based on historical interactions.

> 🔗 **Live App**: [Deployed on Vercel](https://maxwell-ai.vercel.app/)  
---

## Installation Instructions

### Prerequisites

- Node.js (version 18 or higher)
- pnpm (preferred package manager)
- OpenAI API key
- Supabase project with anon/public API key
- Git
- Tailwind CSS

### Setup Steps

1. **Clone the repository:**

```bash
git clone https://github.com/yourusername/Maxwell_AI.git
cd Maxwell_AI
````

2. **Install dependencies:**

```bash
pnpm install
```

3. **Configure environment variables:**

Create a file named `.env.local` in the root directory and add the following:

```env
OPENAI_API_KEY=your_openai_key
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **Start the development server:**

```bash
pnpm dev
```

---

## Usage Guidelines

Maxwell AI can be accessed via a browser-based chat interface. Users can interact naturally to manage tasks, journal reflections, and recall prior conversations.

### Example Commands

* “Remind me to call Alex at 4PM.”
* “What did I say about travel last week?”
* “Summarize my journal entries from the past 3 days.”

The assistant supports both conversational and structured inputs, allowing for flexible use across planning, journaling, and reflection workflows.

---

## Features

* 🧠 Long-term and session-based memory with user-controlled recall and deletion
* 📓 Conversational journaling and summarization
* ✅ Task and reminder tracking
* 🔍 Insight surfacing and pattern recognition
* 🔗 Integration with Supabase and OpenAI APIs
* 🧩 Built using Next.js, TailwindCSS, and v0.dev deployment platform

---

## Contributing Guidelines

To contribute to Maxwell AI:

1. Fork the repository
2. Create a feature branch:

```bash
git checkout -b feature/your-feature
```

3. Make your changes and commit:

```bash
git commit -m "Describe your feature"
```

4. Push to your fork:

```bash
git push origin feature/your-feature
```

5. Submit a pull request with a detailed explanation of your contribution.

Please ensure that your code follows project conventions and includes relevant documentation or comments.

---

## License Information

This project is licensed under the **MIT License**.
You are free to use, modify, and distribute this software with appropriate attribution.

---

## Contact

Maxwell AI is developed and maintained by **Max Langsam**.
For inquiries, feedback, or collaboration, please reach out or submit an issue via the project repository.
