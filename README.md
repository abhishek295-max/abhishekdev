# Abhishek Samadhiya Portfolio

This repository upgrades the existing single-page portfolio in `file.html` while retaining its dark, animated interface. It is a static HTML/CSS/JavaScript frontend with a small Node.js/Express contact service. There is no Spring Boot application, portfolio database, or admin dashboard in this repository.

## Features

- Existing theme, canvas/3D backgrounds, project cards, navigation, and section order are retained.
- Project cards reveal their existing project summaries when selected.
- Architecture nodes and the terminal explain the published portfolio data. The diagram is explicitly illustrative and is not a claim that the listed projects share one deployed architecture.
- Public GitHub repository/activity data loads lazily from GitHub's unauthenticated public API and is cached in the browser for 30 minutes. GitHub may rate-limit anonymous requests; the profile link remains available if the request fails.
- Contact messages are validated, rate-limited, protected by a honeypot, and sent over SMTP by the server. SMTP secrets remain environment variables.
- Netlify deployment uses a serverless contact function at `/api/contact` and serves a copied `file.html` as `index.html`.

## Local development

Requires Node.js 20 or newer.

```sh
cd server
npm ci
```

Create a root `.env` from `.env.example`, then configure `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, and `OWNER_EMAIL`. Do not put credentials in the HTML or commit `.env`. Use provider-issued SMTP credentials. Start the app with:

```sh
npm start
```

Open `http://localhost:3000`. The same-origin Express app serves the page and handles `POST /api/contact`. `npm run dev` enables Node's watch mode. Run automated checks with `npm test` from `server/`.

## Netlify deployment

`netlify.toml` installs the locked server dependencies, copies the page to the publish directory, and bundles `netlify/functions/contact.js`. Configure these environment variables in the Netlify site settings (never in committed files):

- `OWNER_EMAIL`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_SECURE`
- `SMTP_USER`
- `SMTP_PASS`

The local Express server and Netlify function share the same validation and mailer modules. The serverless function's simple in-memory rate limiter is best-effort and can reset between instances; use a durable shared limiter for high-volume production traffic.

## Project facts and limitations

- The project case studies and skill lists are based on the text already published in this portfolio and public repository metadata. Verify any resume, employment, certification, deployment, or technical-contribution claim against its original source before treating it as independently verified.
- No resume PDF is included in this repository. The current external Drive link must be replaced if it is unavailable or outdated.
- The three listed Render demos may sleep or become unavailable; their availability is controlled by their hosting provider.
- The experience entries, certifications, CGPA, and project details are existing portfolio claims, not independently audited credentials.
- Engineering journal examples are educational examples and are labeled as such; they do not describe an implementation in the portfolio backend.
- The live Netlify site is not updated by these local changes. Deploy this repository to publish them, and set the Netlify environment variables above for contact delivery.
