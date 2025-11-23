import React from 'react';
import { BacklogItem } from '../../types';

interface BacklogBoardProps {
  backlog: BacklogItem[];
}

const BacklogBoard: React.FC<BacklogBoardProps> = ({ backlog }) => {
  if (!Array.isArray(backlog) || backlog.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500 bg-gray-50 rounded-lg border">
        No backlog items to display
      </div>
    );
  }

  const epics = backlog.filter(i => (i.type || '').toLowerCase() === 'epic');
  const columns = epics.length ? epics : backlog;

  // Color tokens per type
  const epicClasses = 'bg-indigo-50 text-indigo-900 border-indigo-300';
  const featureClasses = 'bg-emerald-50 text-emerald-900 border-emerald-300';
  const storyClasses = 'bg-amber-50 text-amber-900 border-amber-300';

  return (
    <div className="rounded-xl overflow-x-auto">
      <div className="min-w-[800px] bg-gray-800 p-4 md:p-6 rounded-xl border border-gray-700">
        {/* Legend */}
        <div className="flex gap-4 mb-4 text-xs text-white/80">
          <div className="flex items-center gap-2">
            <span className="inline-block w-4 h-4 rounded border border-indigo-300 bg-indigo-50" /> Epic
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-4 h-4 rounded border border-emerald-300 bg-emerald-50" /> Feature
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-4 h-4 rounded border border-amber-300 bg-amber-50" /> User Story
          </div>
        </div>

        <div className="flex gap-4 md:gap-6">
          {columns.map((epic) => {
            const features = (epic.children || []).filter(c => (c.type || '').toLowerCase() === 'feature');
            const directStories = (epic.children || []).filter(c => (c.type || '').toLowerCase() === 'user story');
            const showDirectStories = features.length === 0 && directStories.length > 0;
            return (
              <div key={epic.id} className="w-[260px] flex-shrink-0">
                <div className={`rounded-xl shadow border px-4 py-2 text-center font-semibold mb-3 ${epicClasses}`}>
                  {epic.title || 'Epic'}
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {features.length > 0 ? (
                    features.map((feat) => (
                      <div key={feat.id} className={`rounded-lg shadow border p-2 ${featureClasses}`}>
                        <div className="text-sm font-semibold mb-2 text-center">
                          {feat.title || 'Feature'}
                        </div>
                        <div className="space-y-2">
                          {(feat.children || []).filter(c => (c.type || '').toLowerCase() === 'user story').map((story) => (
                            <div key={story.id} className={`rounded-md border px-3 py-2 text-xs shadow-sm ${storyClasses}`}>
                              {story.title || 'User Story'}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : showDirectStories ? (
                    <div className={`rounded-lg shadow border p-2 ${featureClasses}`}>
                      <div className="text-sm font-semibold mb-2 text-center">User Stories</div>
                      <div className="space-y-2">
                        {directStories.map((story) => (
                          <div key={story.id} className={`rounded-md border px-3 py-2 text-xs shadow-sm ${storyClasses}`}>
                            {story.title || 'User Story'}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white/60 text-gray-600 rounded-lg border border-dashed border-gray-300 px-3 py-6 text-center text-xs">
                      No features
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BacklogBoard;

