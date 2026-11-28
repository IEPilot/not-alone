// Automatic checks for the notes wall, so notes can go up without anyone approving them.
// "reject" refuses the note with a gentle message; "hold" saves it but never shows it on the wall.

export type NoteCheck = { verdict: "ok" } | { verdict: "reject"; reason: string } | { verdict: "hold" };

const LINK = /(https?:\/\/|www\.|\b[a-z0-9-]+\.(com|net|org|io|co|me|ly|xyz|info|biz|app|gg|us|tv|link|site|online|shop)\b)/i;
const EMAIL = /[^\s@]+@[^\s@]+\.[a-z]{2,}/i;
const PHONE = /(\+?\d[\s().-]*){7,}/;

// Slurs, sexual content and attacks on others are never allowed. Ordinary swearing is: people in pain sometimes swear.
const BLOCKED = [
  "nigger", "nigga", "faggot", "fag", "retard", "retarded", "tranny", "kike", "spic", "chink", "wetback",
  "gook", "dyke", "cunt", "whore", "slut", "rape", "porn", "nude", "nudes", "onlyfans", "dick pic",
  "kys", "kill yourself", "go die",
];

// Notes about ending a life or self-harm are held back: a wall cannot answer, a person can.
const CRISIS = [
  "kill myself", "killing myself", "end my life", "ending my life", "end it all", "suicide", "suicidal",
  "want to die", "wanna die", "better off dead", "no reason to live", "don't want to be here",
  "dont want to be here", "don't want to live", "dont want to live", "hurt myself", "cut myself",
  "cutting myself", "self harm", "self-harm", "overdose", "take my own life", "not be here tomorrow",
];

function normalize(s: string) {
  return s
    .toLowerCase()
    .replace(/[’`]/g, "'")
    .replace(/0/g, "o")
    .replace(/1/g, "i")
    .replace(/3/g, "e")
    .replace(/4/g, "a")
    .replace(/5/g, "s")
    .replace(/\$/g, "s")
    .replace(/@/g, "a");
}

function escapeRe(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function hasPhrase(text: string, phrases: string[]) {
  return phrases.some((p) => new RegExp(`(^|[^a-z])${escapeRe(p)}([^a-z]|$)`).test(text));
}

export function checkNote(raw: string): NoteCheck {
  if (LINK.test(raw)) return { verdict: "reject", reason: "Links are not allowed on the wall." };
  if (EMAIL.test(raw)) return { verdict: "reject", reason: "Please leave out email addresses." };
  if (PHONE.test(raw)) return { verdict: "reject", reason: "Please leave out phone numbers." };
  const text = normalize(raw);
  if (hasPhrase(text, BLOCKED)) return { verdict: "reject", reason: "That note cannot go on the wall. Please keep it kind." };
  if (hasPhrase(text, CRISIS)) return { verdict: "hold" };
  return { verdict: "ok" };
}

// Usernames: 3 to 20 letters, numbers, underscores or periods, and nothing that could pass for the site or its author.
const RESERVED = [
  "admin", "administrator", "moderator", "mod", "brian", "brianluciani", "notalone", "notaloneatmidnight",
  "support", "staff", "anonymous", "monarchforge", "monarchforgestudio",
];

export function checkUsername(name: string): string | null {
  if (!/^[A-Za-z0-9_.]{3,20}$/.test(name)) return "Usernames are 3 to 20 letters, numbers, underscores or periods.";
  const n = normalize(name).replace(/[._]/g, "");
  if (RESERVED.includes(n)) return "That username is not available.";
  if (BLOCKED.some((b) => !b.includes(" ") && b.length > 3 && n.includes(b))) return "That username is not available.";
  return null;
}
