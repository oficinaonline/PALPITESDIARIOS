import { FootballApiResponse, Fixture } from '../types';
import { FOOTBALL_API_BASE_URL } from '../constants';

// Key for local storage of the user's API key
const LS_API_KEY = 'football_api_key';

export const getFootballApiKey = (): string | null => {
  return localStorage.getItem(LS_API_KEY);
};

export const setFootballApiKey = (key: string) => {
  localStorage.setItem(LS_API_KEY, key);
};

const headers = () => {
  const key = getFootballApiKey();
  return {
    'x-rapidapi-key': key || '',
    'x-rapidapi-host': 'v3.football.api-sports.io',
  };
};

// Mock Data
const MOCK_FIXTURES = [
  {
    fixture: { id: 1001, date: new Date().toISOString(), status: { short: "NS", long: "Not Started" } },
    league: { name: "Premier League", country: "England", flag: "https://media.api-sports.io/flags/gb.svg" },
    teams: {
      home: { id: 33, name: "Manchester United", logo: "https://media.api-sports.io/football/teams/33.png" },
      away: { id: 34, name: "Newcastle", logo: "https://media.api-sports.io/football/teams/34.png" }
    },
    goals: { home: null, away: null }
  },
  {
    fixture: { id: 1002, date: new Date().toISOString(), status: { short: "NS", long: "Not Started" } },
    league: { name: "La Liga", country: "Spain", flag: "https://media.api-sports.io/flags/es.svg" },
    teams: {
      home: { id: 541, name: "Real Madrid", logo: "https://media.api-sports.io/football/teams/541.png" },
      away: { id: 529, name: "Barcelona", logo: "https://media.api-sports.io/football/teams/529.png" }
    },
    goals: { home: null, away: null }
  }
];

export const fetchFixtures = async (date: string): Promise<any> => {
  const key = getFootballApiKey();
  if (!key) {
    console.warn("No Football API Key provided. Returning mock data.");
    return { response: MOCK_FIXTURES, errors: [] };
  }

  try {
    const response = await fetch(`${FOOTBALL_API_BASE_URL}/fixtures?date=${date}`, {
      method: 'GET',
      headers: headers(),
    });
    if (!response.ok) throw new Error('Network response was not ok');
    const data = await response.json();
    
    // Simplification to reduce context size
    const simplified = (data.response || []).map((f: any) => ({
      id: f.fixture.id,
      date: f.fixture.date,
      status: f.fixture.status.short,
      league: f.league.name,
      home: { name: f.teams.home.name, id: f.teams.home.id },
      away: { name: f.teams.away.name, id: f.teams.away.id },
      score: f.score?.fulltime ?? null // Safe access
    }));

    return { response: simplified };
  } catch (error) {
    console.error("API fetch error:", error);
    return { response: [], errors: ["Fetch failed"] };
  }
};

export const fetchStandings = async (league: number, season: number): Promise<any> => {
  const key = getFootballApiKey();
  if (!key) return { response: [], errors: ["No API Key"] };

  try {
    const response = await fetch(`${FOOTBALL_API_BASE_URL}/standings?league=${league}&season=${season}`, { headers: headers() });
    const data = await response.json();
    // Return only essential standing info
    if (data.response && data.response.length > 0) {
        const leagueData = data.response[0].league;
        const standings = leagueData.standings.map((group: any[]) => 
            group.map((t: any) => ({
                rank: t.rank,
                team: t.team.name,
                points: t.points,
                goalsDiff: t.goalsDiff,
                form: t.form
            }))
        );
        return { response: standings };
    }
    return data;
  } catch (error) {
    return { response: [], errors: [error] };
  }
};

export const fetchH2H = async (team1: number, team2: number): Promise<any> => {
   const key = getFootballApiKey();
  if (!key) return { response: [], errors: ["No API Key"] };

  try {
    const response = await fetch(`${FOOTBALL_API_BASE_URL}/fixtures/headtohead?h2h=${team1}-${team2}`, { headers: headers() });
    const data = await response.json();
    
    // Limit to last 5 meetings and simplify
    const simplified = (data.response || []).slice(0, 5).map((f: any) => ({
        date: f.fixture.date,
        league: f.league.name,
        home: f.teams.home.name,
        away: f.teams.away.name,
        score: f.score?.fulltime ?? null
    }));
    return { response: simplified };
  } catch (error) {
    return { response: [], errors: [error] };
  }
};

export const fetchOdds = async (fixtureId: number): Promise<any> => {
  const key = getFootballApiKey();
  if (!key) return { response: [], errors: ["No API Key"] };
  
  try {
     const response = await fetch(`${FOOTBALL_API_BASE_URL}/odds?fixture=${fixtureId}`, { headers: headers() });
     const data = await response.json();

     if (!data.response || data.response.length === 0) return { response: [] };

     // Only take the first bookmaker and relevant markets to save tokens
     // Market IDs: 1 (Winner), 5 (Goals Over/Under), 13 (Double Chance), 8 (BTTS)
     const bookmaker = data.response[0].bookmakers?.[0];
     if (!bookmaker) return { response: [] };

     const relevantBets = bookmaker.bets.filter((b: any) => [1, 5, 8, 13].includes(b.id));

     return {
         fixture_id: fixtureId,
         bookmaker: bookmaker.name,
         bets: relevantBets
     };

  } catch (error) {
      return { response: [], errors: [error] };
  }
}

export const fetchStatistics = async (fixtureId: number): Promise<any> => {
    const key = getFootballApiKey();
    if (!key) return { response: [], errors: ["No API Key"] };
    
    try {
       const response = await fetch(`${FOOTBALL_API_BASE_URL}/fixtures/statistics?fixture=${fixtureId}`, { headers: headers() });
       return await response.json();
    } catch (error) {
        return { response: [], errors: [error] };
    }
}