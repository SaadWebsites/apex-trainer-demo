# APEX — Gym / Personal Trainer Demo Site

A complete, ready-to-use demo website for a personal training business with a full booking system:

- **AI chat widget** — talks to visitors and books appointments conversationally
- **Booking page** — structured form with validation
- **Owner email notifications** — every booking emailed instantly (free via [FormSubmit](https://formsubmit.co), no signup/backend)
- **Calendar reminders** — clients add appointments to their phone calendar with a built-in 1-hour alarm
- **Review booster** — "Leave a review" link on confirmation + one-tap review request in the owner dashboard
- **Owner dashboard** (`dashboard.html`) — conversation inbox: all bookings + AI chat transcripts
- **Client portal** (`portal.html`) — clients look up their booking by code (e.g. `APEX-12345`)

## Live demo

- Home: https://saadwebsites.github.io/apex-trainer-demo/
- Booking: https://saadwebsites.github.io/apex-trainer-demo/book.html
- Owner dashboard: https://saadwebsites.github.io/apex-trainer-demo/dashboard.html
- Client portal: https://saadwebsites.github.io/apex-trainer-demo/portal.html

## Configuration

All settings live in `assets/store.js` → `ApexConfig`:

```js
window.ApexConfig = {
  OWNER_EMAIL: 'owner@example.com',        // bookings arrive here ('' = demo mode)
  REVIEW_LINK: 'https://g.page/r/XXX/review', // client's Google review link
  BUSINESS_NAME: 'Business Name',
}
```

## Using this for your own business

1. Edit the text in `index.html` and `book.html` (name, services, prices, contact).
2. Replace the Unsplash image URLs with your own photos.
3. Change `OWNER_EMAIL` in `assets/site.js` to your email.
4. Upload the folder to your host (drag-and-drop on [Netlify Drop](https://app.netlify.com/drop) works).

## Run locally

```
node server.mjs
```

Then open http://localhost:4173/

## Stack

Plain HTML + Tailwind (CDN) + vanilla JS. No build step, no dependencies —
it cannot break the way a framework app can.
