// One place to edit the words and facts the whole site uses.

export const site = {
  name: "Not Alone at Midnight",
  tagline: "A light left on for the long nights.",
  description:
    "A quiet place for people carrying grief, loneliness, anxiety, or a difficult night. Reflections, a book in progress, and gentle resources. You do not have to be awake alone.",
  url: (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, ""),
  author: "Brian",
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

export const book = {
  title: "Not Alone at Midnight",
  subtitle: "Company for the hours when everything feels louder",
  // Change status/date when you have real news. These are shown on /book and the home page.
  status: "In progress",
  statusLine: "Being written now. Join the list and you will hear first, with no pressure and no countdown clocks.",
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
