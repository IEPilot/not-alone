// One place to edit the words and facts the whole site uses.

export const site = {
  name: "Not Alone at Midnight",
  tagline: "You're not the only one awake.",
  description:
    "A quiet place for people carrying grief, loneliness, anxiety, or a difficult night. Reflections, a book, and gentle resources. You do not have to be awake alone.",
  url: (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, ""),
  author: "Brian", // how posts and emails are signed
  authorFullName: "Brian Luciani", // the book's byline
  publisher: "Monarch Forge Studio",
  contactEmail: "", // optional: shown on the contact page if you fill it in
};

export const nav = [
  { href: "/", label: "Home" },
  { href: "/blog", label: "Blog" },
  { href: "/book", label: "Book" },
  { href: "/about", label: "About" },
  { href: "/resources", label: "Resources" },
  { href: "/contact", label: "Contact" },
];

export const categories = ["Grief", "Loneliness", "Anxiety", "Difficult Nights", "Holidays", "Hope"];

// Book chapters live in the same table as posts but are never shown on the public blog.
// The one chapter anyone can read for free.
export const sampleChapterSlug = "chapter-01-when-the-night-gets-long";

export const bookChapterCategory = "Book chapter";

export const book = {
  title: "Not Alone at Midnight",
  subtitle: "Companionship for the hours when life feels heavier",
  tagline: "A Long Night Survival Guide",
  // Change status/date when you have real news. These are shown on /book and the home page.
  status: "Available now",
  statusLine: "$12 for the PDF, delivered instantly. Chapter 1 is free to read first, with no strings. Join the list if you would like to hear about new essays.",
  price: "$12",
  buyUrl: "https://buy.stripe.com/28E9AM9C81M4g9877y8og0a",
  pullQuote: "You do not have to solve your entire life tonight. You only have to be here for this moment.",
  chapters: [
    "When the Night Gets Long",
    "When Life No Longer Feels Familiar",
    "Learning to Live With the Space They Left",
    "The Difference Between Being Alone and Feeling Alone",
    "The Things We Carry",
    "The Weight of the Quiet",
    "The Next Morning",
    "When the Mind Will Not Let Go",
    "When the World Keeps Moving",
    "The Days That Feel Like Setbacks",
    "Learning to Live With What Has Changed",
    "The Power of Presence",
    "Navigating Emotional Currents",
    "Embracing Stillness and Pause",
    "Building Bridges to the Future",
    "Life After Grief",
  ],
  themes: [
    {
      title: "The hour itself",
      text: "Why loneliness, grief, and worry arrive louder after dark, and what it means to simply be with that hour instead of fighting it.",
    },
    {
      title: "Holidays and New Year's",
      text: "The seasons that are supposed to feel full and sometimes feel emptiest. Honest company for them, without forced cheer.",
    },
    {
      title: "Witness, not platitudes",
      text: "No fixing, no silver linings on demand. A steady voice that says what is true: you are not the only one awake.",
    },
    {
      title: "Small lights",
      text: "Tiny, humane things to hold onto through the night. Not a program. Just a few ways to make the next hour a little more bearable.",
    },
  ],
};

export const crisis = {
  headline: "If you are in crisis right now",
  body: "If you might act on thoughts of ending your life, or you are in immediate danger, please reach out to someone right now.",
  lines: [
    { label: "Call or text 988", detail: "988 Suicide & Crisis Lifeline (United States), free, 24 hours a day" },
    { label: "Text HOME to 741741", detail: "Crisis Text Line (United States), free, 24 hours a day" },
    { label: "Call 911", detail: "For an immediate emergency" },
  ],
  outside: "Outside the United States, findahelpline.com lists free, confidential helplines by country.",
};
