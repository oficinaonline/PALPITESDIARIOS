import React from 'react';
import { TrendingUp } from 'lucide-react';
import { Fixture } from '../types';

interface MatchCardProps {
  fixture: Fixture;
  onClick: () => void;
}

const MatchCard: React.FC<MatchCardProps> = ({ fixture, onClick }) => {
  const date = new Date(fixture.fixture.date);
  const time = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  
  // Verifica se o jogo é "Jogável" para análise (Não iniciado)
  // 'NS' = Not Started, 'TBD' = Time To Be Defined
  const status = fixture.fixture.status.short;
  const isPlayable = ['NS', 'TBD'].includes(status);

  return (
    <div 
      onClick={isPlayable ? onClick : undefined}
      className={`
        rounded-xl p-4 border flex flex-col gap-3 transition-all duration-300 relative
        ${isPlayable 
          ? 'group bg-gray-850 hover:bg-gray-800 transform hover:scale-[1.02] cursor-pointer border-gray-700 hover:border-green-500/50 hover:shadow-lg hover:shadow-green-900/20' 
          : 'bg-gray-900/50 border-gray-800 opacity-60 cursor-not-allowed grayscale-[0.5]'
        }
      `}
    >
      <div className="flex justify-between items-center text-xs text-gray-400">
        <div className="flex items-center gap-2">
          {fixture.league.flag && <img src={fixture.league.flag} alt={fixture.league.country} className="w-4 h-4 rounded-full" />}
          <span className="truncate max-w-[120px] font-medium">{fixture.league.name}</span>
        </div>
        <div className="flex items-center gap-2">
            <span className="font-mono">{time}</span>
            {!isPlayable && (
                <span className="text-[10px] font-bold bg-gray-800 px-1.5 py-0.5 rounded text-gray-500 border border-gray-700">
                    {status}
                </span>
            )}
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <img src={fixture.teams.home.logo} alt={fixture.teams.home.name} className="w-8 h-8 object-contain shrink-0" />
          <span className={`font-semibold text-sm truncate ${isPlayable ? 'text-gray-200' : 'text-gray-400'}`}>{fixture.teams.home.name}</span>
        </div>
        <div className="text-gray-600 font-bold px-2 text-xs shrink-0">VS</div>
        <div className="flex items-center gap-3 flex-1 justify-end min-w-0">
          <span className={`font-semibold text-sm truncate text-right ${isPlayable ? 'text-gray-200' : 'text-gray-400'}`}>{fixture.teams.away.name}</span>
          <img src={fixture.teams.away.logo} alt={fixture.teams.away.name} className="w-8 h-8 object-contain shrink-0" />
        </div>
      </div>

      <div className={`mt-1 pt-2 border-t flex justify-center items-center ${isPlayable ? 'border-gray-800/50' : 'border-gray-800/20'}`}>
         {isPlayable ? (
            <div className="p-1.5 rounded-full bg-gray-800 group-hover:bg-green-500/20 transition-colors">
                <TrendingUp className="w-4 h-4 text-gray-500 group-hover:text-green-400 transition-colors" />
            </div>
         ) : (
            <span className="text-xs text-gray-600 font-medium italic">
                {['FT', 'AET', 'PEN'].includes(status) ? 'Encerrado' : 'Indisponível'}
            </span>
         )}
      </div>
    </div>
  );
};

export default MatchCard;