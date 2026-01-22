import type { Epic } from '../types/gantt';

export function exportToJSON(epics: Epic[], projectName: string) {
  const data = {
    project: projectName,
    exportedAt: new Date().toISOString(),
    epics: epics.map(epic => ({
      ...epic,
      tasks: epic.tasks || []
    }))
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `gantt-${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportToCSV(epics: Epic[]) {
  const headers = ['Epic', 'Task', 'Owner', 'Type', 'Status', 'Start Month', 'Duration', 'Description'];
  const rows = [headers];

  epics.forEach(epic => {
    epic.tasks?.forEach(task => {
      rows.push([
        epic.name,
        task.name,
        task.owner,
        task.type,
        task.status,
        task.start_month.toString(),
        task.duration.toString(),
        task.description
      ]);
    });
  });

  const escapeCell = (value: string | number | null | undefined) => {
    const text = String(value ?? '');
    return `"${text.replace(/"/g, '""')}"`;
  };
  const csv = rows.map(row => row.map(cell => escapeCell(cell)).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `gantt-${Date.now()}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
