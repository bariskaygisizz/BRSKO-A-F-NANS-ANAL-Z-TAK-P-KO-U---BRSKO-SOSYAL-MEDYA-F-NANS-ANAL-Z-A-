import { put, list, getDownloadUrl } from "@vercel/blob";

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  plan: string;
  createdAt: string;
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

function emailKey(email: string) {
  return `users/${Buffer.from(email.toLowerCase()).toString("base64url")}.json`;
}
function videoKey(id: string) { return `videos/${id}.json`; }
function userVideosKey(userId: string) { return `uvideos/${userId}.json`; }

async function readJson<T>(pathname: string): Promise<T | null> {
  try {
    const { blobs } = await list({ prefix: pathname, limit: 1, token: TOKEN });
    if (!blobs.length) return null;
    const dlUrl = await getDownloadUrl(blobs[0].url, { token: TOKEN });
    const res = await fetch(dlUrl);
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
    };
    await writeJson(emailKey(data.email), user);
    return user;
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
