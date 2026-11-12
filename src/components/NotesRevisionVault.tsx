import React, { useState } from 'react';
import { RevisionMaterial, UserProfile, NoteCategory } from '../types';
import { 
  FileText, 
  Upload, 
  Download, 
  Eye, 
  Search, 
  Filter, 
  ShieldCheck, 
  User, 
  Share2, 
  BookOpen, 
  Tag, 
  CheckCircle,
  FileCheck,
  Send,
  X
} from 'lucide-react';
import { formatNotesUploadBroadcast, getWhatsAppGroupShareUrl } from '../utils/whatsapp';

interface NotesRevisionVaultProps {
  materials: RevisionMaterial[];
  currentUser: UserProfile;
  onUploadMaterial: (material: RevisionMaterial) => void;
  onBroadcastNotification: (title: string, message: string, type: 'notes_upload') => void;
}

export const NotesRevisionVault: React.FC<NotesRevisionVaultProps> = ({
  materials,
  currentUser,
  onUploadMaterial,
  onBroadcastNotification
}) => {
  const isRep = currentUser.role === 'class_rep';
  const [filterScope, setFilterScope] = useState<'all' | 'official' | 'my_notes'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterUnit, setFilterUnit] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Upload modal state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [previewMaterial, setPreviewMaterial] = useState<RevisionMaterial | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [unitCode, setUnitCode] = useState('COM 220');
  const [category, setCategory] = useState<NoteCategory>('lecture_notes');
  const [description, setDescription] = useState('');
  const [fileContent, setFileContent] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState('1.5 MB');
  const [isSharedWithClass, setIsSharedWithClass] = useState(true);
  const [notifyWhatsApp, setNotifyWhatsApp] = useState(true);

  // Extract unique units
  const availableUnits = Array.from(new Set(materials.map((m) => m.unitCode)));

  const categoryLabels: Record<NoteCategory, string> = {
    lecture_notes: 'Lecture Notes',
    past_paper: 'Past Exam Paper',
    cat_revision: 'CAT Revision & Solutions',
    summary_cheat_sheet: 'Summary Cheat Sheet',
    lab_report: 'Lab Manual / Report',
    assignment_solution: 'Assignment Solution'
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      setFileSize(`${sizeMB} MB`);

      // Read text content if plain text/markdown
      if (file.type.includes('text') || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setFileContent(event.target?.result as string || '');
        };
        reader.readAsText(file);
      } else {
        setFileContent(`[Document content: ${file.name}]\nPrepared for University of Eldoret students.\nUnit: ${unitCode}\nUpload Timestamp: ${new Date().toLocaleString()}`);
      }
    }
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !unitCode.trim()) return;

    const generatedFileName = fileName.trim() || `${unitCode.replace(/\s+/g, '_')}_${title.slice(0, 15).replace(/\s+/g, '_')}.pdf`;

    const newMaterial: RevisionMaterial = {
      id: `rev-${Date.now()}`,
      title: title.trim(),
      unitCode: unitCode.trim().toUpperCase(),
      description: description.trim() || 'Uploaded revision material for University of Eldoret coursework.',
      category,
      uploadedBy: isRep ? `${currentUser.fullName} (Class Rep)` : currentUser.fullName,
      uploaderRole: currentUser.role,
      uploaderRegNo: currentUser.regNumber,
      uploadedAt: 'Just now',
      fileSize: fileSize || '1.8 MB',
      fileType: generatedFileName.endsWith('.docx') ? 'docx' : 'pdf',
      fileName: generatedFileName,
      isRepOfficial: isRep,
      isSharedWithClass,
      tags: [unitCode, category.replace(/_/g, ' ')],
      downloadsCount: 1,
      fileContent: fileContent || `UNIVERSITY OF ELDORET\nCourse: ${unitCode} - ${title}\nUploaded by: ${currentUser.fullName}\n\nKey Concepts & Revision Checklist:\n1. Review chapter summaries and lecture slides.\n2. Practice past continuous assessment test (CAT) problems.\n3. Form small group discussions to verify answers.`
    };

    onUploadMaterial(newMaterial);

    // If Class Rep or requested, broadcast on WhatsApp!
    if (notifyWhatsApp || isRep) {
      const broadcast = formatNotesUploadBroadcast(
        newMaterial.unitCode,
        newMaterial.title,
        categoryLabels[newMaterial.category],
        currentUser.fullName,
        newMaterial.fileName,
        newMaterial.fileSize
      );

      onBroadcastNotification(
        `New Notes Uploaded: ${newMaterial.unitCode}`,
        broadcast,
        'notes_upload'
      );

      if (isRep) {
        window.open(getWhatsAppGroupShareUrl(broadcast), '_blank');
      }
    }

    // Reset
    setTitle('');
    setDescription('');
    setFileName('');
    setFileContent('');
    setIsUploadOpen(false);
  };

  const handleDownload = (material: RevisionMaterial) => {
    const element = document.createElement('a');
    const file = new Blob([material.fileContent || `${material.title} - University of Eldoret`], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = material.fileName.replace(/\.pdf$/, '.txt');
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Filtering
  const filteredMaterials = materials.filter((m) => {
    // Scope filter
    if (filterScope === 'official' && !m.isRepOfficial) return false;
    if (filterScope === 'my_notes' && m.uploaderRegNo !== currentUser.regNumber) return false;

    // Unit filter
    if (filterUnit !== 'all' && m.unitCode !== filterUnit) return false;

    // Category filter
    if (filterCategory !== 'all' && m.category !== filterCategory) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        m.title.toLowerCase().includes(q) ||
        m.unitCode.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q) ||
        m.uploadedBy.toLowerCase().includes(q)
      );
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner with Image Rest Area */}
      <div className="relative rounded-2xl overflow-hidden border border-stone-200 bg-emerald-950 text-white shadow-sm">
        <div className="absolute inset-0 z-0 opacity-25">
          <img
            src="/src/assets/images/uoe_revision_notes_1794485751928.jpg"
            alt="University of Eldoret Revision Desk"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="relative z-10 p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 backdrop-blur-[1px]">
          <div className="max-w-2xl">
            <span className="text-xs font-bold text-amber-400 tracking-wider uppercase mb-1 block">
              Academic Resource Repository
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              University of Eldoret Revision Vault & Notes
            </h2>
            <p className="text-xs md:text-sm text-emerald-100 mt-2 leading-relaxed">
              Access official lecturer slides uploaded by your Class Representative, past CAT papers with marking schemes, and upload your personal study notes.
            </p>
          </div>

          <button
            onClick={() => setIsUploadOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold text-xs rounded-xl shadow-md transition-all whitespace-nowrap"
          >
            <Upload className="w-4 h-4" />
            <span>Upload My Notes / Materials</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl p-4 border border-stone-200 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Scope Segmented Control */}
          <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-lg">
            <button
              onClick={() => setFilterScope('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
                filterScope === 'all'
                  ? 'bg-white text-emerald-950 font-bold shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              All Materials ({materials.length})
            </button>
            <button
              onClick={() => setFilterScope('official')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
                filterScope === 'official'
                  ? 'bg-white text-emerald-950 font-bold shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Class Rep Official
            </button>
            <button
              onClick={() => setFilterScope('my_notes')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
                filterScope === 'my_notes'
                  ? 'bg-white text-emerald-950 font-bold shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              My Uploads
            </button>
          </div>

          {/* Search Box */}
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notes by unit, keyword, or topic..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-stone-300 focus:outline-none focus:ring-1 focus:ring-emerald-700 bg-white"
            />
          </div>
        </div>

        {/* Secondary Category & Unit dropdowns */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-stone-100 text-xs text-stone-600">
          <span className="font-semibold text-stone-700">Filter by:</span>

          <select
            value={filterUnit}
            onChange={(e) => setFilterUnit(e.target.value)}
            className="px-2.5 py-1 rounded-md border border-stone-300 bg-white text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-emerald-700"
          >
            <option value="all">All Course Units</option>
            {availableUnits.map((u) => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-2.5 py-1 rounded-md border border-stone-300 bg-white text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-emerald-700"
          >
            <option value="all">All Categories</option>
            {Object.entries(categoryLabels).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>

          <span className="ml-auto text-stone-500">
            Showing <strong className="text-stone-900">{filteredMaterials.length}</strong> items
          </span>
        </div>
      </div>

      {/* Materials Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMaterials.map((item) => {
          return (
            <div
              key={item.id}
              className="bg-white rounded-xl border border-stone-200 hover:border-emerald-600/40 p-5 shadow-sm transition-all flex flex-col justify-between"
            >
              <div>
                {/* Card Header */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-900 border border-emerald-200">
                    {item.unitCode}
                  </span>
                  {item.isRepOfficial ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-950 border border-amber-300">
                      <ShieldCheck className="w-3 h-3 text-amber-700" />
                      OFFICIAL
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-stone-500">
                      <User className="w-3 h-3" />
                      Student Note
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-stone-900 text-sm leading-snug line-clamp-2">
                  {item.title}
                </h3>

                <p className="text-xs text-stone-500 mt-2 line-clamp-2 leading-relaxed">
                  {item.description}
                </p>

                {/* Metadata Row */}
                <div className="mt-3.5 pt-3 border-t border-stone-100 text-[11px] text-stone-500 flex items-center justify-between">
                  <span>{categoryLabels[item.category] || item.category}</span>
                  <span className="font-mono">{item.fileSize}</span>
                </div>
                <div className="text-[10px] text-stone-400 mt-1 truncate">
                  By {item.uploadedBy} · {item.uploadedAt}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => setPreviewMaterial(item)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-emerald-800 hover:bg-emerald-50 rounded-md transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Preview</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      const shareText = formatNotesUploadBroadcast(
                        item.unitCode,
                        item.title,
                        categoryLabels[item.category],
                        item.uploadedBy,
                        item.fileName,
                        item.fileSize
                      );
                      window.open(getWhatsAppGroupShareUrl(shareText), '_blank');
                    }}
                    className="p-1.5 text-stone-500 hover:text-emerald-800 rounded hover:bg-stone-100"
                    title="Share note on WhatsApp group"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDownload(item)}
                    className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 rounded-md shadow-xs transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredMaterials.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-stone-200 p-8">
          <BookOpen className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-stone-800">No revision materials found</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1">
            Try adjusting your search query or upload the first revision note for this unit.
          </p>
        </div>
      )}

      {/* Upload Material Modal */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl border border-stone-200 w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col">
            <div className="bg-emerald-950 px-6 py-4 text-white flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">
                  {isRep ? 'Upload Official Course Handout / Past Paper' : 'Upload Student Revision Material'}
                </h3>
                <p className="text-xs text-emerald-200">
                  {isRep ? 'Broadcasting to registered student WhatsApp numbers' : 'Save to your vault or share with classmates'}
                </p>
              </div>
              <button
                onClick={() => setIsUploadOpen(false)}
                className="text-emerald-300 hover:text-white p-1 rounded"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="p-6 space-y-3.5 overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Document / Material Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Chapter 3 Normalization Notes or CAT 2 Past Paper"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Course Unit Code
                  </label>
                  <input
                    type="text"
                    required
                    value={unitCode}
                    onChange={(e) => setUnitCode(e.target.value.toUpperCase())}
                    placeholder="e.g. COM 220"
                    className="w-full px-3 py-2 text-sm font-mono uppercase rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Material Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as NoteCategory)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  >
                    {Object.entries(categoryLabels).map(([val, label]) => (
                      <option key={val} value={val}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Description / Topics Covered
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Key definitions, formula breakdown, and solved 2024 past CAT questions."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
              </div>

              {/* File Attachment / Drag Drop */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Select Revision File (PDF, DOCX, TXT, Images)
                </label>
                <div className="border-2 border-dashed border-stone-300 rounded-lg p-4 text-center hover:border-emerald-600 transition-colors bg-stone-50">
                  <input
                    type="file"
                    id="note-file-upload"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label htmlFor="note-file-upload" className="cursor-pointer block">
                    <Upload className="w-6 h-6 text-stone-400 mx-auto mb-1.5" />
                    <span className="text-xs font-semibold text-emerald-800">
                      {fileName ? `Attached: ${fileName}` : 'Click to choose file or browse'}
                    </span>
                    <span className="text-[11px] text-stone-400 block mt-0.5">
                      Max file size: 25 MB
                    </span>
                  </label>
                </div>
              </div>

              {/* Paste or Type Quick Notes / Summary Content */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  In-App Reading Summary or Study Notes
                </label>
                <textarea
                  rows={4}
                  value={fileContent}
                  onChange={(e) => setFileContent(e.target.value)}
                  placeholder="Paste or write revision notes summary here for fellow students to read directly in the app..."
                  className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-700 bg-white"
                />
              </div>

              {/* WhatsApp Notification Checkbox */}
              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifyWhatsApp}
                    onChange={(e) => setNotifyWhatsApp(e.target.checked)}
                    className="mt-0.5 rounded text-emerald-800 focus:ring-emerald-700"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-emerald-950 block">
                      Broadcast to WhatsApp Group / Students
                    </span>
                    <span className="text-emerald-700 text-[11px]">
                      Alerts registered coursemates on WhatsApp that new notes for {unitCode || 'this unit'} are available for download.
                    </span>
                  </div>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-stone-600 hover:bg-stone-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg shadow-sm"
                >
                  Save & Publish Notes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* In-App Document Reader Modal */}
      {previewMaterial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl border border-stone-200 w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
            <div className="bg-emerald-950 px-6 py-4 text-white flex items-center justify-between">
              <div>
                <span className="font-mono text-xs text-amber-300 font-bold block">
                  {previewMaterial.unitCode} · {categoryLabels[previewMaterial.category]}
                </span>
                <h3 className="text-base font-bold text-white line-clamp-1">
                  {previewMaterial.title}
                </h3>
              </div>
              <button
                onClick={() => setPreviewMaterial(null)}
                className="text-emerald-300 hover:text-white p-1 rounded"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              <div className="p-3 bg-stone-50 rounded-lg border border-stone-200 text-xs text-stone-600 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <strong>Uploaded by:</strong> {previewMaterial.uploadedBy} ({previewMaterial.uploadedAt})
                </div>
                <div className="font-mono">
                  File: {previewMaterial.fileName} ({previewMaterial.fileSize})
                </div>
              </div>

              <div className="p-4 bg-stone-900 text-stone-100 rounded-lg font-mono text-xs leading-relaxed overflow-x-auto whitespace-pre-wrap">
                {previewMaterial.fileContent || 'No document text preview available.'}
              </div>
            </div>

            <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between">
              <button
                onClick={() => {
                  const shareText = formatNotesUploadBroadcast(
                    previewMaterial.unitCode,
                    previewMaterial.title,
                    categoryLabels[previewMaterial.category],
                    previewMaterial.uploadedBy,
                    previewMaterial.fileName,
                    previewMaterial.fileSize
                  );
                  window.open(getWhatsAppGroupShareUrl(shareText), '_blank');
                }}
                className="text-emerald-800 font-bold text-xs hover:underline flex items-center gap-1"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Share Note to WhatsApp</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPreviewMaterial(null)}
                  className="px-4 py-2 text-xs font-medium text-stone-600 hover:bg-stone-200 rounded-lg"
                >
                  Close
                </button>
                <button
                  onClick={() => handleDownload(previewMaterial)}
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Document</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
