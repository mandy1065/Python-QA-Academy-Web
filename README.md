# Python QA Academy — interactive learning platform

A clean, freeCodeCamp-style **original** learning experience for beginner Python QA engineers. This is a separate Vite web application, **not Streamlit**.

## Features

- 12 chapters, **108 lessons** (including 72 runnable coding exercises, 12 final projects, 12 introductions and 12 debugging labs)
- Instructions + worked examples alongside `main.py` editor and console
- Real Python execution using Pyodide in a **Web Worker**
- 5-second execution timeout that terminates and recreates the worker
- Run Code and Run Tests, exact expected-output checks, hints and full solutions
- Progress and draft code saved locally in the browser; downloadable JSON submission
- Responsive layout and keyboard Tab indentation
- No server-side execution of learner code and no student account requirement

## Run locally

Requires Node.js 20+ and an internet connection for the Pyodide runtime.

```bash
npm install
npm run dev
```

Open the local address shown by Vite (usually `http://localhost:5173`).

## Test and build

```bash
npm test
python tests/verify_solutions.py
npm run build
```

## Deploy

Deploy the built `dist/` directory to GitHub Pages, Netlify, Cloudflare Pages or Vercel. On Vercel use framework **Vite**, build command `npm run build`, output `dist`. For a GitHub Pages subpath, set Vite `base` appropriately.

## Curriculum editing

Edit `src/curriculum.json`. Each lesson has an explanation, example, instructions, starter, hint, solution and expected console output. Run `npm test` and `python tests/verify_solutions.py` to validate the content.

## Important limitations

- Grading currently compares printed output exactly. It does **not** perform hidden Python unit tests or verify the algorithm. This is an initial release, not a full certification assessment platform.
- Progress is local to one browser, not a shared instructor database.
- Pyodide is isolated in a Web Worker and time-limited, but **not** a full security boundary for hostile Python code. Avoid using it for high-trust exams or handling secrets.
- First Python load downloads several megabytes. Some third-party Python libraries and network features are unavailable.
- Lesson text is original; interface draws on general coding-school design patterns and is not affiliated with freeCodeCamp.
