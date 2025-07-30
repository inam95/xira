# Xira

A lightweight, modern project management tool inspired by Jira. Xira offers essential features for workspace, project, task, and member management, with a clean UI and efficient workflows.

[Live Demo](https://xira-three.vercel.app)

---

## Features

- **Authentication:** Secure user sign-up, login, and session management.
- **Workspace Management:** Create and manage multiple workspaces for different teams or projects.
- **Project Management:** Organize projects within workspaces, each with its own settings and members.
- **Task Management:** Create, assign, and track tasks with status updates and priorities.
- **Member Management:** Invite and manage workspace/project members with role-based access.
- **Modern UI:** Responsive, accessible, and visually appealing interface.
- **Efficient Data Fetching:** Optimized state management and API calls using React Query.
- **Performance:** Fast load times and smooth user experience.

---

## Tech Stack

- **Frontend:** [Next.js](https://nextjs.org/), [React](https://react.dev/), [TailwindCSS](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/)
- **Backend/API:** [Hono](https://hono.dev/), [Appwrite](https://appwrite.io/)
- **State/Data:** [React Query](https://tanstack.com/query/latest)
- **UI/UX:** [shadcn/ui](https://ui.shadcn.com/), [TailwindCSS](https://tailwindcss.com/)
- **Deployment:** [Vercel](https://vercel.com/)

---

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/inam95/xira.git
   cd xira
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Configure environment variables:**
   - Refer `src/config.ts` and set up the `.env`

4. **Run the development server:**
   ```bash
   pnpm run dev
   ```

5. **Open [http://localhost:3000](http://localhost:3000) in your browser.**
