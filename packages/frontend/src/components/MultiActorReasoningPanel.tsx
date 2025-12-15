import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Brain, Users, CheckCircle, Clock } from 'lucide-react';

interface ReasoningStep {
  step: number;
  actor: string;
  action: string;
  content: string;
  reasoning?: string;
  timestamp: string;
  isFinal?: boolean;
}

interface MultiActorReasoningPanelProps {
  steps: ReasoningStep[];
  isStreaming?: boolean;
}

export function MultiActorReasoningPanel({ steps, isStreaming = false }: MultiActorReasoningPanelProps) {
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set([steps.length - 1]));

  const toggleStep = (stepNumber: number) => {
    const newExpanded = new Set(expandedSteps);
    if (newExpanded.has(stepNumber)) {
      newExpanded.delete(stepNumber);
    } else {
      newExpanded.add(stepNumber);
    }
    setExpandedSteps(newExpanded);
  };

  const getStepIcon = (action: string) => {
    switch (action) {
      case 'analyze': return <Brain className="w-5 h-5 text-purple-400" />;
      case 'respond': return <Users className="w-5 h-5 text-emerald-400" />;
      case 'consult': return <Users className="w-5 h-5 text-blue-400" />;
      case 'contribute': return <CheckCircle className="w-5 h-5 text-teal-400" />;
      case 'synthesize': return <Brain className="w-5 h-5 text-yellow-400" />;
      default: return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStepColor = (action: string) => {
    switch (action) {
      case 'analyze': return 'border-purple-500/30 bg-purple-500/5';
      case 'respond': return 'border-emerald-500/30 bg-emerald-500/5';
      case 'consult': return 'border-blue-500/30 bg-blue-500/5';
      case 'contribute': return 'border-teal-500/30 bg-teal-500/5';
      case 'synthesize': return 'border-yellow-500/30 bg-yellow-500/10';
      default: return 'border-gray-500/30 bg-gray-500/5';
    }
  };

  if (steps.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3 mt-4">
      {/* Header */}
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <Brain className="w-4 h-4" />
        <span>Razonamiento Multi-Actor ({steps.length} pasos)</span>
        {isStreaming && (
          <span className="flex items-center gap-1 text-emerald-400 animate-pulse">
            <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
            En progreso...
          </span>
        )}
      </div>

      {/* Reasoning Steps */}
      <div className="space-y-2">
        {steps.map((step) => (
          <div
            key={step.step}
            className={`border rounded-lg overflow-hidden transition-all ${getStepColor(step.action)} ${
              step.isFinal ? 'ring-2 ring-yellow-400/50' : ''
            }`}
          >
            {/* Step Header (Always Visible) */}
            <button
              onClick={() => toggleStep(step.step)}
              className="w-full flex items-center justify-between p-3 hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                {getStepIcon(step.action)}
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white text-sm">
                      {step.actor}
                    </span>
                    {step.isFinal && (
                      <span className="px-2 py-0.5 bg-yellow-400/20 text-yellow-400 text-xs rounded-full font-medium">
                        Final
                      </span>
                    )}
                  </div>
                  {step.reasoning && (
                    <p className="text-xs text-gray-400 mt-0.5">{step.reasoning}</p>
                  )}
                </div>
              </div>
              {expandedSteps.has(step.step) ? (
                <ChevronUp className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              )}
            </button>

            {/* Step Content (Expandible) */}
            {expandedSteps.has(step.step) && (
              <div className="px-3 pb-3 pt-0">
                <div className="pl-8 border-l-2 border-white/10 ml-2">
                  <p className="text-sm text-gray-200 leading-relaxed whitespace-pre-wrap">
                    {step.content}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(step.timestamp).toLocaleTimeString('es-ES')}
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Summary */}
      {!isStreaming && steps.length > 0 && (
        <div className="text-xs text-gray-400 text-center pt-2">
          {steps.filter(s => s.actor.startsWith('NEURA')).length} NEURAs participaron •{' '}
          {Math.round((new Date(steps[steps.length - 1].timestamp).getTime() - 
            new Date(steps[0].timestamp).getTime()) / 1000)}s total
        </div>
      )}
    </div>
  );
}
