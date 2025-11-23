import React, { useState } from 'react';
import { BarChart3, Target, Zap, Users } from 'lucide-react';
import { BacklogItem } from '../../types';

interface BacklogStatsProps {
  backlog: BacklogItem[];
}

interface ItemCounts {
  epics: number;
  features: number;
  stories: number;
}

const BacklogStats: React.FC<BacklogStatsProps> = ({ backlog }) => {
  const [expanded] = useState<Record<string, boolean>>({});

  const countItems = (items: BacklogItem[]): ItemCounts => {
    let epics = 0, features = 0, stories = 0;
    items.forEach(item => {
      if (item.type === 'Epic') epics++;
      else if (item.type === 'Feature') features++;
      else if (item.type === 'User Story') stories++;
      if (item.children) {
        const childCounts = countItems(item.children);
        epics += childCounts.epics;
        features += childCounts.features;
        stories += childCounts.stories;
      }
    });
    return { epics, features, stories };
  };

  const counts = countItems(backlog);

  return (
    <div className="bg-white rounded-lg shadow-lg border p-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <BarChart3 className="w-5 h-5" />
        Project Statistics
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-600" />
            <span className="font-semibold text-blue-800">Epics</span>
          </div>
          <div className="text-2xl font-bold text-blue-900">{counts.epics}</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-green-600" />
            <span className="font-semibold text-green-800">Features</span>
          </div>
          <div className="text-2xl font-bold text-green-900">{counts.features}</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-600" />
            <span className="font-semibold text-purple-800">User Stories</span>
          </div>
          <div className="text-2xl font-bold text-purple-900">{counts.stories}</div>
        </div>
      </div>
    </div>
  );
};

export default BacklogStats;

