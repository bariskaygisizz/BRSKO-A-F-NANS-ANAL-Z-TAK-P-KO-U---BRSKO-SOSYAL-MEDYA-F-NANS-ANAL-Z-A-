import { put, list } from "@vercel/blob";

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  plan: string;
  createdAt: string;
  monthlyAiCount?: number;
  monthlyReset?: string; // "YYYY-MM"
}

export interface Video {
  id: string;
  userId: string;
  title: string;
  prompt: string;
  imageUrl?: string | null;
  videoUrl?: string | null;
  status: string;
  platform: string;
  type: "video" | "image";
  createdAt: string;
  updatedAt: string;
}

const TOKEN = process.env.BLOB_READ_WRITE_TOKEN;
const FREE_AI_LIMIT = 10; // per month

function emailKey(email: string) {
  return `users/${Buffer.from(email.toLowerCase()).toString("base64url")}.json`;
}
function videoKey(id: string) { return `videos/${id}.json`; }
function userVideosKey(userId: string) { return `uvideos/${userId}.json`; }

async function readJson<T>(pathname: string): Promise<T | null> {
  try {
    const { blobs } = await list({ prefix: pathname, limit: 1, token: TOKEN });
    if (!blobs.length) return null;
    const res = await fetch(blobs[0].url, { headers: { Authorization: `Bearer ${TOKEN}` } });
    if (!res.ok) return null;
    return res.json() as Promise<T>;
  } catch {
    return null;
  }
}

async function writeJson<T>(pathname: string, data: T): Promise<void> {
  await put(pathname, JSON.stringify(data), {
    access: "private",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
    token: TOKEN,
  });
}

export const store = {
  async getUserByEmail(email: string): Promise<User | null> {
    return readJson<User>(emailKey(email));
  },

  async createUser(data: { name: string; email: string; password: string }): Promise<User> {
    const user: User = {
      id: crypto.randomUUID(),
      name: data.name,
      email: data.email,
      password: data.password,
      plan: "free",
      createdAt: new Date().toISOString(),
      monthlyAiCount: 0,
      monthlyReset: new Date().toISOString().slice(0, 7),
    };
    await writeJson(emailKey(data.email), user);
    return user;
  },

  async getAiLimit(email: string): Promise<{ used: number; limit: number; remaining: number }> {
    const user = await readJson<User>(emailKey(email));
    if (!user) return { used: 0, limit: FREE_AI_LIMIT, remaining: FREE_AI_LIMIT };
    const currentMonth = new Date().toISOString().slice(0, 7);
    const used = user.monthlyReset === currentMonth ? (user.monthlyAiCount ?? 0) : 0;
    const limit = user.plan === "free" ? FREE_AI_LIMIT : 999;
    return { used, limit, remaining: Math.max(0, limit - used) };
  },

  async incrementAiCount(email: string): Promise<{ allowed: boolean; remaining: number }> {
    const user = await readJson<User>(emailKey(email));
    if (!user) return { allowed: false, remaining: 0 };
    const currentMonth = new Date().toISOString().slice(0, 7);
    const used = user.monthlyReset === currentMonth ? (user.monthlyAiCount ?? 0) : 0;
    const limit = user.plan === "free" ? FREE_AI_LIMIT : 999;
    if (used >= limit) return { allowed: false, remaining: 0 };
    await writeJson(emailKey(email), {
      ...user,
      monthlyAiCount: used + 1,
      monthlyReset: currentMonth,
    });
    return { allowed: true, remaining: limit - used - 1 };
  },

  async createVideo(data: {
    userId: string; title: string; prompt: string;
    imageUrl?: string | null; type?: "video" | "image";
  }): Promise<Video> {
    const video: Video = {
      id: crypto.randomUUID(),
      userId: data.userId,
      title: data.title,
      prompt: data.prompt,
      imageUrl: data.imageUrl ?? null,
      videoUrl: null,
      status: "processing",
      platform: "all",
      type: data.type ?? "video",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await writeJson(videoKey(video.id), video);
    const existing = await readJson<string[]>(userVideosKey(data.userId)) ?? [];
    await writeJson(userVideosKey(data.userId), [video.id, ...existing]);
    return video;
  },

  async getVideo(id: string): Promise<Video | null> {
    return readJson<Video>(videoKey(id));
  },

  async updateVideo(id: string, data: { status: string; videoUrl?: string }): Promise<void> {
    const existing = await readJson<Video>(videoKey(id));
    if (!existing) return;
    await writeJson(videoKey(id), { ...existing, ...data, updatedAt: new Date().toISOString() });
  },

  async getUserVideos(userId: string): Promise<Video[]> {
    const ids = await readJson<string[]>(userVideosKey(userId)) ?? [];
    const videos = await Promise.all(ids.slice(0, 20).map(id => readJson<Video>(videoKey(id))));
    return videos.filter((v): v is Video => v !== null);
  },
};
