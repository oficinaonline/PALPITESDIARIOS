export interface Message {
  role: 'user' | 'model' | 'system';
  content: string;
  timestamp: number;
  isError?: boolean;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  apiKey?: string; // Optional: Only if we need to store a separate key for Football API
}

export interface Fixture {
  fixture: {
    id: number;
    date: string;
    status: { short: string; long: string };
  };
  league: {
    name: string;
    country: string;
    flag: string;
  };
  teams: {
    home: { id: number; name: string; logo: string; winner?: boolean };
    away: { id: number; name: string; logo: string; winner?: boolean };
  };
  goals: {
    home: number | null;
    away: number | null;
  };
}

export interface FootballApiResponse<T> {
  response: T[];
  errors: any[];
}
