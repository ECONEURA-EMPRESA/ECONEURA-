import React from 'react';
import { BookOpen, FileText } from 'lucide-react';
import { cx } from '../utils/classnames';

interface Reference {
  index: number;
  docId: string;
  title: string;
  pages: string;
  preview: string;
}

interface ReferencesBlockProps {
  references: Reference[];
  darkMode: boolean;
}

export function ReferencesBlock({ references, darkMode }: ReferencesBlockProps) {
  if (!references || references.length === 0) return null;

  return (
    <div className={cx(
      "mt-4 p-4 rounded-xl border",
      darkMode 
        ? 'bg-blue-500/10 border-blue-500/30' 
        : 'bg-blue-50 border-blue-200'
    )}>
      <div className="flex items-center gap-2 mb-3">
        <BookOpen className={cx("w-4 h-4", darkMode ? 'text-blue-400' : 'text-blue-600')} />
        <h4 className={cx(
          "text-sm font-semibold",
          darkMode ? 'text-blue-300' : 'text-blue-900'
        )}>
          Referencias
        </h4>
      </div>
      <div className="space-y-3">
        {references.map((ref) => (
          <div
            key={ref.docId}
            className={cx(
              "p-3 rounded-lg border transition-all",
              darkMode 
                ? 'bg-slate-900/50 border-slate-700 hover:border-slate-600' 
                : 'bg-white/80 border-slate-200 hover:border-slate-300'
            )}
          >
            <div className="flex items-start gap-3">
              <div className={cx(
                "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold",
                darkMode ? 'bg-blue-600/30 text-blue-300' : 'bg-blue-100 text-blue-700'
              )}>
                {ref.index}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <FileText className={cx("w-3.5 h-3.5 flex-shrink-0", darkMode ? 'text-slate-400' : 'text-slate-500')} />
                  <p className={cx(
                    "text-sm font-medium truncate",
                    darkMode ? 'text-slate-200' : 'text-slate-900'
                  )}>
                    {ref.title}
                  </p>
                  <span className={cx(
                    "text-xs px-2 py-0.5 rounded-full flex-shrink-0",
                    darkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-600'
                  )}>
                    p. {ref.pages}
                  </span>
                </div>
                <p className={cx(
                  "text-xs line-clamp-2",
                  darkMode ? 'text-slate-400' : 'text-slate-600'
                )}>
                  {ref.preview}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}




