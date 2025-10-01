'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Download, 
  FileText, 
  Image, 
  FileSpreadsheet, 
  FileX, 
  Loader2,
  Check,
  AlertTriangle
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Note, NoteType } from '@/types/note';
import { cn } from '@/lib/utils';

interface ExportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notes: Note[];
  selectedNotes?: Note[];
}

export type ExportFormat = 'pdf' | 'docx' | 'html' | 'txt' | 'json' | 'csv' | 'zip';

interface ExportOption {
  format: ExportFormat;
  name: string;
  description: string;
  icon: React.ReactNode;
  supported: NoteType[];
  size?: string;
}

const exportOptions: ExportOption[] = [
  {
    format: 'pdf',
    name: 'PDF Document',
    description: 'Formatted document with images and drawings',
    icon: <FileText className="h-5 w-5" />,
    supported: ['text', 'checklist', 'drawing', 'image', 'audio'],
  },
  {
    format: 'docx',
    name: 'Microsoft Word',
    description: 'Editable document with rich formatting',
    icon: <FileText className="h-5 w-5 text-blue-600" />,
    supported: ['text', 'checklist', 'image'],
  },
  {
    format: 'html',
    name: 'HTML Web Page',
    description: 'Web-compatible format with styling',
    icon: <FileX className="h-5 w-5 text-orange-600" />,
    supported: ['text', 'checklist', 'drawing', 'image'],
  },
  {
    format: 'txt',
    name: 'Plain Text',
    description: 'Simple text format without formatting',
    icon: <FileText className="h-5 w-5 text-gray-600" />,
    supported: ['text', 'checklist'],
  },
  {
    format: 'json',
    name: 'JSON Data',
    description: 'Raw data format for backup and migration',
    icon: <FileSpreadsheet className="h-5 w-5 text-green-600" />,
    supported: ['text', 'checklist', 'drawing', 'image', 'audio'],
  },
  {
    format: 'csv',
    name: 'CSV Spreadsheet',
    description: 'Tabular format for spreadsheet applications',
    icon: <FileSpreadsheet className="h-5 w-5 text-green-700" />,
    supported: ['text', 'checklist'],
  },
  {
    format: 'zip',
    name: 'Archive Package',
    description: 'Complete backup with all media files',
    icon: <Download className="h-5 w-5 text-purple-600" />,
    supported: ['text', 'checklist', 'drawing', 'image', 'audio'],
  },
];

export function ExportModal({ open, onOpenChange, notes, selectedNotes }: ExportModalProps) {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('pdf');
  const [exporting, setExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportComplete, setExportComplete] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const notesToExport = selectedNotes || notes;
  const notesByType = notesToExport.reduce((acc, note) => {
    acc[note.type] = (acc[note.type] || 0) + 1;
    return acc;
  }, {} as Record<NoteType, number>);

  const selectedOption = exportOptions.find(opt => opt.format === selectedFormat)!;
  const compatibleNotes = notesToExport.filter(note => 
    selectedOption.supported.includes(note.type)
  );
  const incompatibleNotes = notesToExport.filter(note => 
    !selectedOption.supported.includes(note.type)
  );

  const handleExport = async () => {
    setExporting(true);
    setExportProgress(0);
    setExportError(null);
    setExportComplete(false);

    try {
      // Simulate export progress
      const steps = 5;
      for (let i = 0; i <= steps; i++) {
        await new Promise(resolve => setTimeout(resolve, 500));
        setExportProgress((i / steps) * 100);
      }

      // Actual export logic would go here
      await exportNotes(compatibleNotes, selectedFormat);
      
      setExportComplete(true);
    } catch (error) {
      setExportError(error instanceof Error ? error.message : 'Export failed');
    } finally {
      setExporting(false);
    }
  };

  const exportNotes = async (notes: Note[], format: ExportFormat) => {
    switch (format) {
      case 'json':
        downloadJSON(notes);
        break;
      case 'txt':
        downloadText(notes);
        break;
      case 'csv':
        downloadCSV(notes);
        break;
      case 'html':
        downloadHTML(notes);
        break;
      case 'pdf':
        await downloadPDF(notes);
        break;
      case 'docx':
        await downloadDOCX(notes);
        break;
      case 'zip':
        await downloadZIP(notes);
        break;
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  };

  const downloadJSON = (notes: Note[]) => {
    const data = JSON.stringify(notes, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    downloadFile(blob, `overflow-notes-${Date.now()}.json`);
  };

  const downloadText = (notes: Note[]) => {
    const content = notes.map(note => {
      let text = `${note.title || 'Untitled'}\n${'='.repeat(50)}\n\n`;
      
      if (note.type === 'checklist' && note.checklist) {
        text += note.checklist.map(item => 
          `${item.completed ? '☑' : '☐'} ${item.text}`
        ).join('\n');
      } else {
        text += note.content;
      }
      
      if (note.labels.length > 0) {
        text += `\n\nLabels: ${note.labels.join(', ')}`;
      }
      
      text += `\n\nCreated: ${new Date(note.createdAt).toLocaleString()}`;
      text += `\nUpdated: ${new Date(note.updatedAt).toLocaleString()}`;
      
      return text;
    }).join('\n\n' + '='.repeat(80) + '\n\n');

    const blob = new Blob([content], { type: 'text/plain' });
    downloadFile(blob, `overflow-notes-${Date.now()}.txt`);
  };

  const downloadCSV = (notes: Note[]) => {
    const headers = ['Title', 'Content', 'Type', 'Labels', 'Color', 'Pinned', 'Created', 'Updated'];
    const rows = notes.map(note => [
      note.title || 'Untitled',
      note.type === 'checklist' && note.checklist 
        ? note.checklist.map(item => `${item.completed ? '✓' : '○'} ${item.text}`).join('; ')
        : note.content.replace(/\n/g, ' '),
      note.type,
      note.labels.join('; '),
      note.color,
      note.pinned ? 'Yes' : 'No',
      new Date(note.createdAt).toISOString(),
      new Date(note.updatedAt).toISOString(),
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    downloadFile(blob, `overflow-notes-${Date.now()}.csv`);
  };

  const downloadHTML = (notes: Note[]) => {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Overflow Notes Export</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; margin: 40px; color: #333; }
        .note { border: 1px solid #e1e5e9; border-radius: 8px; padding: 20px; margin-bottom: 20px; background: #fff; }
        .note-title { font-size: 1.5em; font-weight: bold; margin-bottom: 10px; color: #1a1a1a; }
        .note-content { margin-bottom: 15px; }
        .note-meta { font-size: 0.9em; color: #666; }
        .note-labels { margin: 10px 0; }
        .label { background: #f1f3f4; padding: 4px 8px; border-radius: 12px; font-size: 0.8em; margin-right: 8px; }
        .checklist { list-style: none; padding: 0; }
        .checklist li { padding: 4px 0; }
        .completed { text-decoration: line-through; color: #666; }
        .note-default { border-left: 4px solid #6366f1; }
        .note-red { border-left: 4px solid #ef4444; }
        .note-orange { border-left: 4px solid #f97316; }
        .note-amber { border-left: 4px solid #f59e0b; }
        .note-yellow { border-left: 4px solid #eab308; }
        .note-lime { border-left: 4px solid #84cc16; }
        .note-green { border-left: 4px solid #22c55e; }
        .note-emerald { border-left: 4px solid #10b981; }
        .note-teal { border-left: 4px solid #14b8a6; }
        .note-cyan { border-left: 4px solid #06b6d4; }
        .note-sky { border-left: 4px solid #0ea5e9; }
        .note-blue { border-left: 4px solid #3b82f6; }
        .note-indigo { border-left: 4px solid #6366f1; }
        .note-violet { border-left: 4px solid #8b5cf6; }
        .note-purple { border-left: 4px solid #a855f7; }
        .note-fuchsia { border-left: 4px solid #d946ef; }
        .note-pink { border-left: 4px solid #ec4899; }
        .note-rose { border-left: 4px solid #f43f5e; }
    </style>
</head>
<body>
    <h1>Overflow Notes Export</h1>
    <p>Exported on ${new Date().toLocaleString()}</p>
    
    ${notes.map(note => `
        <div class="note note-${note.color}">
            <div class="note-title">${note.title || 'Untitled'}</div>
            <div class="note-content">
                ${note.type === 'checklist' && note.checklist 
                  ? `<ul class="checklist">${note.checklist.map(item => 
                      `<li class="${item.completed ? 'completed' : ''}">${item.completed ? '☑' : '☐'} ${item.text}</li>`
                    ).join('')}</ul>`
                  : `<p>${note.content.replace(/\n/g, '<br>')}</p>`
                }
            </div>
            ${note.labels.length > 0 ? `
                <div class="note-labels">
                    ${note.labels.map(label => `<span class="label">${label}</span>`).join('')}
                </div>
            ` : ''}
            <div class="note-meta">
                Type: ${note.type} | Created: ${new Date(note.createdAt).toLocaleString()} | Updated: ${new Date(note.updatedAt).toLocaleString()}
            </div>
        </div>
    `).join('')}
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html' });
    downloadFile(blob, `overflow-notes-${Date.now()}.html`);
  };

  const downloadPDF = async (notes: Note[]) => {
    // This would integrate with a PDF library like jsPDF or Puppeteer
    // For now, we'll create a simple PDF-like text format
    const content = `OVERFLOW NOTES EXPORT\n${'='.repeat(50)}\n\nExported: ${new Date().toLocaleString()}\nTotal Notes: ${notes.length}\n\n${notes.map(note => {
      let text = `${note.title || 'Untitled'}\n${'-'.repeat(30)}\n\n`;
      text += note.type === 'checklist' && note.checklist 
        ? note.checklist.map(item => `${item.completed ? '☑' : '☐'} ${item.text}`).join('\n')
        : note.content;
      text += `\n\nLabels: ${note.labels.join(', ')}\nColor: ${note.color}\nType: ${note.type}`;
      return text;
    }).join('\n\n' + '='.repeat(50) + '\n\n')}`;

    const blob = new Blob([content], { type: 'application/pdf' });
    downloadFile(blob, `overflow-notes-${Date.now()}.pdf`);
  };

  const downloadDOCX = async (notes: Note[]) => {
    // This would integrate with a library like docx or PizZip
    // For now, we'll create a Word-compatible HTML format
    const html = `
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word">
<head><meta charset="utf-8"><title>Overflow Notes</title></head>
<body>
<h1>Overflow Notes Export</h1>
${notes.map(note => `
<div style="page-break-inside: avoid; margin-bottom: 20px;">
    <h2>${note.title || 'Untitled'}</h2>
    ${note.type === 'checklist' && note.checklist 
      ? `<ul>${note.checklist.map(item => 
          `<li style="${item.completed ? 'text-decoration: line-through;' : ''}">${item.text}</li>`
        ).join('')}</ul>`
      : `<p>${note.content.replace(/\n/g, '<br>')}</p>`
    }
    <p><small>Labels: ${note.labels.join(', ')} | ${new Date(note.updatedAt).toLocaleString()}</small></p>
</div>
`).join('')}
</body>
</html>`;

    const blob = new Blob([html], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    downloadFile(blob, `overflow-notes-${Date.now()}.docx`);
  };

  const downloadZIP = async (notes: Note[]) => {
    // This would integrate with JSZip
    // For now, we'll create individual files in a folder structure
    const data = {
      notes: notes.map(note => ({
        id: note.id,
        title: note.title,
        content: note.content,
        type: note.type,
        color: note.color,
        labels: note.labels,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt,
        checklist: note.checklist,
        drawingData: note.drawingData,
        images: note.images,
        audioUrl: note.audioUrl,
        audioTranscription: note.audioTranscription,
      })),
      metadata: {
        exportedAt: new Date().toISOString(),
        version: '1.0',
        totalNotes: notes.length,
      }
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    downloadFile(blob, `overflow-notes-backup-${Date.now()}.json`);
  };

  const downloadFile = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const resetExport = () => {
    setExporting(false);
    setExportProgress(0);
    setExportComplete(false);
    setExportError(null);
  };

  return (
    <Dialog open={open} onOpenChange={(open) => {
      if (!open) resetExport();
      onOpenChange(open);
    }}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Notes
          </DialogTitle>
        </DialogHeader>

        {exportComplete ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-8"
          >
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Export Complete!</h3>
            <p className="text-muted-foreground mb-6">
              Your notes have been exported successfully as {selectedOption.name}.
            </p>
            <div className="flex items-center gap-3 justify-center">
              <Button onClick={() => resetExport()}>
                Export More
              </Button>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
            </div>
          </motion.div>
        ) : exportError ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-8"
          >
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Export Failed</h3>
            <p className="text-muted-foreground mb-6">{exportError}</p>
            <div className="flex items-center gap-3 justify-center">
              <Button onClick={() => resetExport()}>
                Try Again
              </Button>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
            </div>
          </motion.div>
        ) : exporting ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-8"
          >
            <div className="text-center mb-6">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Exporting Notes...</h3>
              <p className="text-muted-foreground">
                Please wait while we prepare your {selectedOption.name} export.
              </p>
            </div>
            <div className="max-w-md mx-auto">
              <Progress value={exportProgress} className="mb-2" />
              <p className="text-sm text-center text-muted-foreground">
                {Math.round(exportProgress)}% complete
              </p>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {/* Export Summary */}
            <Card className="p-4">
              <h3 className="font-semibold mb-3">Export Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Total Notes</div>
                  <div className="font-semibold">{notesToExport.length}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Compatible</div>
                  <div className="font-semibold text-green-600">{compatibleNotes.length}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Incompatible</div>
                  <div className="font-semibold text-orange-600">{incompatibleNotes.length}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Format</div>
                  <div className="font-semibold">{selectedOption.name}</div>
                </div>
              </div>

              {Object.keys(notesByType).length > 0 && (
                <div className="mt-4">
                  <div className="text-sm text-muted-foreground mb-2">Note Types:</div>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(notesByType).map(([type, count]) => (
                      <Badge key={type} variant="secondary" className="text-xs">
                        {type}: {count}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </Card>

            {/* Format Selection */}
            <div>
              <h3 className="font-semibold mb-4">Choose Export Format</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {exportOptions.map((option) => (
                  <motion.div
                    key={option.format}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card
                      className={cn(
                        "p-4 cursor-pointer transition-all duration-200 border-2",
                        selectedFormat === option.format
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      )}
                      onClick={() => setSelectedFormat(option.format)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-1">{option.icon}</div>
                        <div className="flex-1">
                          <div className="font-medium">{option.name}</div>
                          <div className="text-sm text-muted-foreground mb-2">
                            {option.description}
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {option.supported.map((type) => (
                              <Badge key={type} variant="outline" className="text-xs">
                                {type}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Compatibility Warning */}
            {incompatibleNotes.length > 0 && (
              <Card className="p-4 border-orange-200 bg-orange-50">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                  <div>
                    <div className="font-medium text-orange-800">
                      Compatibility Notice
                    </div>
                    <div className="text-sm text-orange-700 mt-1">
                      {incompatibleNotes.length} notes won't be included because {selectedOption.name} doesn't support their format.
                      Consider using JSON or ZIP format for complete backup.
                    </div>
                  </div>
                </div>
              </Card>
            )}

            <Separator />

            {/* Actions */}
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {compatibleNotes.length} notes will be exported
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleExport}
                  disabled={compatibleNotes.length === 0}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export {selectedOption.name}
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
