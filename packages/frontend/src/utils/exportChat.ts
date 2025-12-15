// Export chat to JSON
export function exportJSON(messages: Array<{role: string; content: string; timestamp?: string}>, filename: string = 'chat-export.json') {
  const data = {
    exportDate: new Date().toISOString(),
    messagesCount: messages.length,
    messages: messages.map(msg => ({
      role: msg.role,
      content: msg.content,
      timestamp: msg.timestamp || new Date().toISOString()
    }))
  };

  const blob = new (window as any).Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  downloadBlob(blob, filename);
}

// Export chat to CSV
export function exportCSV(messages: Array<{role: string; content: string; timestamp?: string}>, filename: string = 'chat-export.csv') {
  const headers = ['Role', 'Content', 'Timestamp'];
  const rows = messages.map(msg => [
    msg.role,
    `"${msg.content.replace(/"/g, '""')}"`, // Escape quotes properly
    msg.timestamp || new Date().toISOString()
  ]);

  const csv = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  const blob = new (window as any).Blob([csv], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, filename);
}

// Export chat to Markdown
export function exportMarkdown(messages: Array<{role: string; content: string; timestamp?: string}>, filename: string = 'chat-export.md') {
  const markdown = [
    '# Chat Export',
    '',
    `**Export Date:** ${new Date().toISOString()}`,
    `**Messages:** ${messages.length}`,
    '',
    '---',
    '',
    ...messages.map(msg => {
      const role = msg.role === 'user' ? '👤 User' : '🤖 Assistant';
      return `### ${role}\n\n${msg.content}\n`;
    })
  ].join('\n');

  const blob = new (window as any).Blob([markdown], { type: 'text/markdown' });
  downloadBlob(blob, filename);
}

// Helper function to download blob
function downloadBlob(blob: any, filename: string) {
  const url = (window as any).URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  (window as any).URL.revokeObjectURL(url);
}

