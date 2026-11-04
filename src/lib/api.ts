import { BACKEND_URL } from './utils';
import { Song, TopTrack, Playlist, User } from '@/types';

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = BACKEND_URL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    token?: string | null
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!res.ok) {
      let errorMsg = `API Error: ${res.status}`;
      try {
        const errorData = await res.json();
        if (errorData.error) errorMsg = errorData.error;
        else if (errorData.message) errorMsg = errorData.message;
      } catch {
        // Fallback to text or status
      }
      const err = new Error(errorMsg) as Error & { status?: number };
      err.status = res.status;
      throw err;
    }

    if (res.status === 204) {
      return {} as T;
    }

    return res.json();
  }

  // Auth Endpoints
  async register(data: { username: string; password?: string; telegramId?: string }): Promise<{ user: User; sessionId: string }> {
    return this.request<{ user: User; sessionId: string }>('/api/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(data: { username: string; password?: string }): Promise<{ user: User; sessionId: string }> {
    return this.request<{ user: User; sessionId: string }>('/api/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getMe(token: string): Promise<User> {
    return this.request<User>('/api/me', { method: 'GET' }, token);
  }

  async updateProfilePhoto(token: string, base64: string): Promise<{ message: string; user: User }> {
    return this.request<{ message: string; user: User }>('/api/me/profile-photo', {
      method: 'PATCH',
      body: JSON.stringify({ base64 }),
    }, token);
  }

  async updateEmail(token: string, email: string | null): Promise<{ message: string; user: User }> {
    return this.request<{ message: string; user: User }>('/api/me/email', {
      method: 'PATCH',
      body: JSON.stringify({ email }),
    }, token);
  }

  async logout(token: string): Promise<void> {
    await this.request('/api/logout', { method: 'POST' }, token).catch(() => {});
  }

  // Songs & Media Endpoints
  async getSongs(token: string): Promise<Song[]> {
    return this.request<Song[]>('/api/songs/sync/pending', { method: 'GET' }, token);
  }

  async getTopTracks(): Promise<TopTrack[]> {
    return this.request<TopTrack[]>('/api/songs/top_track', { method: 'GET' });
  }

  async getLikedSongIds(token: string): Promise<string[]> {
    return this.request<string[]>('/api/songs/likes', { method: 'GET' }, token);
  }

  async toggleLike(token: string, songId: string): Promise<{ liked: boolean }> {
    return this.request<{ liked: boolean }>(`/api/songs/${songId}/like`, {
      method: 'POST',
    }, token);
  }

  async recordPlay(token: string, songId: string): Promise<void> {
    await this.request(`/api/songs/${songId}/play`, { method: 'POST' }, token);
  }

  async syncPlays(token: string, plays: { songId: string; playedAt: string; durationSec: number }[]): Promise<void> {
    await this.request('/api/songs/plays/sync', {
      method: 'POST',
      body: JSON.stringify({ plays }),
    }, token);
  }

  // Playlists Endpoints
  async getPlaylists(token: string): Promise<Playlist[]> {
    return this.request<Playlist[]>('/api/playlists', { method: 'GET' }, token);
  }

  async createPlaylist(token: string, title: string, description?: string): Promise<{ id: string }> {
    return this.request<{ id: string }>('/api/playlists', {
      method: 'POST',
      body: JSON.stringify({ title, description }),
    }, token);
  }

  async getPlaylist(token: string, playlistId: string): Promise<Playlist> {
    return this.request<Playlist>(`/api/playlists/${playlistId}`, { method: 'GET' }, token);
  }

  async addSongToPlaylist(token: string, playlistId: string, songId: string): Promise<void> {
    await this.request(`/api/playlists/${playlistId}/songs`, {
      method: 'POST',
      body: JSON.stringify({ songId }),
    }, token);
  }

  async removeSongFromPlaylist(token: string, playlistId: string, songId: string): Promise<void> {
    await this.request(`/api/playlists/${playlistId}/songs/${songId}`, {
      method: 'DELETE',
    }, token);
  }

  async deletePlaylist(token: string, playlistId: string): Promise<void> {
    await this.request(`/api/playlists/${playlistId}`, {
      method: 'DELETE',
    }, token);
  }

  // Telegram Integration
  async getTelegramLinkStatus(token: string): Promise<{ linked: boolean; telegramId?: string | null }> {
    return this.request<{ linked: boolean; telegramId?: string | null }>('/api/telegram/link-status', {
      method: 'GET',
    }, token);
  }

  async generateTelegramLinkToken(token: string): Promise<{ token: string; botUsername: string }> {
    return this.request<{ token: string; botUsername: string }>('/api/telegram/link-token', {
      method: 'POST',
    }, token);
  }

  async unlinkTelegram(token: string): Promise<{ success: boolean; user?: User }> {
    return this.request<{ success: boolean; user?: User }>('/api/telegram/unlink', {
      method: 'POST',
    }, token);
  }

  // Audio Recognition (Tone Match / Shazam)
  async matchAudio(audioBlob: Blob): Promise<{ success: boolean; match?: any; error?: string; message?: string; durationMs?: number }> {
    const url = `${this.baseUrl}/api/match`;
    console.log(`[ToneMatch:Client] Sending ${audioBlob.size} bytes (${audioBlob.type}) to ${url}...`);

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/octet-stream',
      },
      body: audioBlob,
    });

    if (!res.ok) {
      const text = await res.text();
      console.error(`[ToneMatch:Client:Error] Server returned HTTP ${res.status}:`, text);
      throw new Error(`Recognition failed with status ${res.status}: ${text}`);
    }

    const data = await res.json();
    console.log(`[ToneMatch:Client] Match response:`, data);
    return data;
  }
}

export const api = new ApiClient();
