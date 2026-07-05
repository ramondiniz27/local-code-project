export const conversations = [
  {
    id: "w408i",
    title: "React component architecture",
    time: "2m ago",
    active: true,
  },
  {
    id: "SGFWI",
    title: "Python data pipeline optimization",
    time: "1h ago",
    active: false,
  },
  {
    id: "z5mEEt",
    title: "Debugging WebSocket connection",
    time: "3h ago",
    active: false,
  },
  {
    id: "u7Dia",
    title: "SQL query performance tuning",
    time: "Yesterday",
    active: false,
  },
  {
    id: "qvFQ4",
    title: "Docker container setup guide",
    time: "Yesterday",
    active: false,
  },
  {
    id: "Sm19D",
    title: "TypeScript generics explained",
    time: "2d ago",
    active: false,
  },
  {
    id: "PCQcJ",
    title: "API rate limiting strategies",
    time: "3d ago",
    active: false,
  },
  {
    id: "Swfiu",
    title: "CSS Grid vs Flexbox layout",
    time: "5d ago",
    active: false,
  },
];

export const user1Text =
  "Can you help me understand how async/await works in JavaScript? I'm having trouble with error handling in async functions.";

export const ai1Text1 =
  "I'd be happy to help you understand async/await and error handling! Here's a breakdown:";

export const codeBlock1 = `async function fetchData() {
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed:', error);
    throw error;
  }
}`;

export const ai1Text2 =
  "The try/catch block catches any errors that occur during the awaited operations. You can also use .catch() on the promise returned by the async function.";

export const user2Text =
  "That makes sense! What about handling multiple async operations in parallel?";

export const ai2Text1 =
  "Great question! For parallel execution, use Promise.all(). It runs multiple promises concurrently and waits for all to resolve:";

export const codeBlock2 = `const [users, posts] = await Promise.all([
  fetchUsers(),
  fetchPosts()
]);`;

export const models = [
  { id: "opus", name: "Claude Opus 4", description: "Most capable" },
  { id: "sonnet4", name: "Claude Sonnet 4", description: "Balanced" },
  {
    id: "sonnet35",
    name: "Claude 3.5 Sonnet",
    description: "Fast & smart",
    selected: true,
  },
  { id: "haiku", name: "Claude 3.5 Haiku", description: "Fastest" },
];

export const profile = {
  name: "Ramon Diniz",
  plan: "Pro Plan",
  initial: "R",
};
