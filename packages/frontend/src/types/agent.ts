import React from 'react';

export interface Agent {
  id: string;
  title: string;
  desc: string; // Legacy field, map to description if needed or just keep
  description?: string; // New field required by UI
  icon?: React.ElementType | string; // Strict typing
  role?: 'sales' | 'support' | 'analyst' | 'manager' | 'legal' | 'marketing' | 'innovation';
  capabilities?: string[];
  department?: string;
  status?: 'active' | 'busy' | 'offline' | 'error' | 'inactive';
  lastRun?: string;
  model?: string;
  temperature?: number;
  pills?: string[];
}

export interface NeuraMetric {
  title: string;
  subtitle: string;
  tags: string[];
  value?: {
    timeSavedHoursMonth: number;
    valueEurMonth: number;
    roiPercentage: number;
    problem: string;
    solution: string;
  };
}

export interface Department {
  id: string;
  name: string;
  chips: string[];
  neura: NeuraMetric;
  agents: Agent[];
}
