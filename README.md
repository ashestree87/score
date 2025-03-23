# Quiz Funnel Web App

A lightweight quiz funnel application built with Astro, designed for deployment on Cloudflare Pages/Workers. The application includes manually created landing, quiz, and results pages, as well as an embeddable widget for integration onto other websites.

## Features

- **Landing & Quiz Pages**: Responsive pages built with Astro file-based routing
- **Interactive Quiz Component**: React-based quiz components with on-demand hydration
- **Scoring Logic**: Simple scoring system to generate personalized feedback
- **Data Capture**: Form submissions processed via Cloudflare Workers
- **Embeddable Widget**: Embed the quiz on any website via iframe
- **Cloud Deployment**: Built for deployment on Cloudflare Pages and Workers

## Project Structure

```
/
├── public/
├── src/
│   ├── components/
│   │   └── QuizWidget.jsx    # React component for embeddable widget
│   ├── layouts/
│   │   ├── Layout.astro      # Base layout
│   │   └── QuizLayout.astro  # Quiz-specific layout with progress bar
│   ├── pages/
│   │   ├── index.astro       # Landing page
│   │   ├── embed.astro       # Embed instructions page
│   │   ├── widget.astro      # Minimal iframe-only version
│   │   ├── api/              # Cloudflare Worker API endpoints
│   │   │   └── quiz-submissions.js  # API endpoint for quiz data
│   │   └── quiz/
│   │       ├── start.astro   # Quiz start page
│   │       ├── results.astro # Results page
│   │       └── question/     # Question pages
│   │           ├── 1.astro
│   │           ├── 2.astro
│   │           └── ...
│   └── assets/
├── astro.config.mjs          # Astro configuration
├── tailwind.config.mjs       # Tailwind CSS configuration
└── package.json
```

## Getting Started

### Installation

1. Clone the repository:
   ```
   git clone [repository-url]
   cd quiz-funnel
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:4321` to see the application.

## Adding New Quizzes

To add a new quiz type:

1. Create new question pages in `src/pages/quiz/question/` directory
2. Update the scoring logic in `src/pages/quiz/results.astro`
3. Modify the form fields in `src/pages/quiz/start.astro`

## Embedding the Widget

To embed the quiz widget on another website:

1. Deploy the application to Cloudflare Pages
2. Use the iframe code from the embed page:
   ```html
   <iframe 
     src="https://your-domain.com/widget" 
     width="100%" 
     height="600" 
     frameborder="0" 
     allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope" 
     allowfullscreen
   ></iframe>
   ```

3. Customize the width and height as needed

## Deploying to Cloudflare

1. Create a Cloudflare Pages project and connect your repository
2. Set the build command to `npm run build`
3. Set the build output directory to `dist`
4. Set the following environment variables:
   - `NODE_VERSION` to `16` or higher

## Modifying the Scoring System

The scoring system is defined in `src/pages/quiz/results.astro`. You can modify the weights and criteria to match your specific quiz requirements.

## Customizing the Design

The application uses Tailwind CSS for styling. The main color scheme is defined in `tailwind.config.mjs`. You can modify the colors, fonts, and other design elements there.

## License

[MIT License](LICENSE)

## Deployment

### GitHub Pages

This project can be easily deployed to GitHub Pages:

1. Push your code to GitHub
2. Enable GitHub Pages in your repository settings
3. The included GitHub Actions workflow will automatically build and deploy your site

### Netlify

To deploy to Netlify:

1. Push your code to GitHub
2. Connect your GitHub repository to Netlify
3. The included `netlify.toml` file will configure the build settings

### Cloudflare Pages

To deploy to Cloudflare Pages:

1. Push your code to GitHub
2. Connect your GitHub repository to Cloudflare Pages
3. Set the build command to `npm run build`
4. Set the output directory to `dist`

## Troubleshooting

If you encounter dependency conflicts during installation, try running:

```bash
npm install --legacy-peer-deps
```

This project includes an `.npmrc` file with `legacy-peer-deps=true` to help avoid these issues.

## Cloudflare Bindings Setup

This project uses Cloudflare KV and D1 for data storage. To set up the bindings:

1. Copy `wrangler.example.toml` to `wrangler.toml`:
   ```bash
   cp wrangler.example.toml wrangler.toml
   ```

2. Create your Cloudflare resources:
   
   **KV Namespace:**
   ```bash
   # Creates a KV namespace called "score_kv"
   wrangler kv:namespace create "score_kv"
   wrangler kv:namespace create "score_kv" --preview
   ```

   **D1 Database:**
   ```bash
   # Creates a D1 database called "score_db"
   wrangler d1 create score_db
   wrangler d1 execute score_db --file=./schema.sql
   ```

3. Update `wrangler.toml` with your actual IDs:
   - Replace `your_kv_id_here` with the ID of your "score_kv" namespace
   - Replace `your_preview_kv_id_here` with the preview ID of your "score_kv" namespace
   - Replace `your_d1_id_here` with the ID of your "score_db" database
   - Replace `your_api_key_here` with your API key

   Note: In your code, you'll access these resources using the binding names (`SCORE_KV` and `SCORE_DB`).

4. **Important:** Never commit your `wrangler.toml` file to Git as it contains sensitive information.

For local development with Cloudflare bindings, use:

```bash
npm run dev:cf
```

Or, if you have Docker installed, run:

```bash
docker-compose up
```

## Verifying Bindings

After deploying or when running locally, you can verify that your bindings are working correctly by:

1. Completing a quiz on your site
2. Checking the debug panel on the results page (click "Show Debug Info")
3. Using the admin API with your security token:
   - List data: `/api/admin?action=list&token=your_admin_token_here`
   - Check schema: `/api/admin?action=schema&token=your_admin_token_here`

The admin API is protected by a token that you set in your `wrangler.toml` file. Make sure to use a strong, random token in production.

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/withastro/astro/tree/latest/examples/basics)
[![Open with CodeSandbox](https://assets.codesandbox.io/github/button-edit-lime.svg)](https://codesandbox.io/p/sandbox/github/withastro/astro/tree/latest/examples/basics)
[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/withastro/astro?devcontainer_path=.devcontainer/basics/devcontainer.json)

> 🧑‍🚀 **Seasoned astronaut?** Delete this file. Have fun!

![just-the-basics](https://github.com/withastro/astro/assets/2244813/a0a5533c-a856-4198-8470-2d67b1d7c554)

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
/
├── public/
│   └── favicon.svg
├── src/
│   ├── layouts/
│   │   └── Layout.astro
│   └── pages/
│       └── index.astro
└── package.json
```

To learn more about the folder structure of an Astro project, refer to [our guide on project structure](https://docs.astro.build/en/basics/project-structure/).

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## 👀 Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).
