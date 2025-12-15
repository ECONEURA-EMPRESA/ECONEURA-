import React from 'react';
import { Lead } from '../core/types';

interface LeadCardProps {
    lead: Lead;
    onClick?: (id: string) => void;
}

export const LeadCard: React.FC<LeadCardProps> = ({ lead, onClick }) => {
    const statusColors = {
        new: 'bg-blue-100 text-blue-800',
        contacted: 'bg-yellow-100 text-yellow-800',
        polluted: 'bg-red-100 text-red-800',
        qualified: 'bg-green-100 text-green-800',
        converted: 'bg-purple-100 text-purple-800',
    };

    return (
        <div
            className="p-4 bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onClick?.(lead.id)}
        >
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="font-semibold text-gray-900">{lead.name}</h3>
                    <p className="text-sm text-gray-500">Source: {lead.source}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[lead.status]}`}>
                    {lead.status.toUpperCase()}
                </span>
            </div>
            <div className="mt-3 flex justify-between items-center text-sm">
                <span className="text-gray-400">{new Date(lead.createdAt).toLocaleDateString()}</span>
                <span className="font-bold text-gray-700">Score: {lead.score}</span>
            </div>
        </div>
    );
};
