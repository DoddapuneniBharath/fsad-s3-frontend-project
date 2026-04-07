import { useState } from 'react';
import { useApp, ROLES } from '../context/AppContext';
import {
    Plus, Edit2, Trash2, Eye, FileText, HelpCircle, Package,
    Filter, Check, X, BookOpen, Clock, User, ChevronDown, ChevronUp,
    Layers, PenLine,
} from 'lucide-react';

const CONTENT_TYPES = {
    article: { icon: <FileText size={16} />, label: 'Article', color: '#06b6d4', bg: 'rgba(6,182,212,0.15)' },
    lesson: { icon: <BookOpen size={16} />, label: 'Lesson', color: '#6c63ff', bg: 'rgba(108,99,255,0.15)' },
    quiz: { icon: <HelpCircle size={16} />, label: 'Quiz', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
    guide: { icon: <Layers size={16} />, label: 'Study Guide', color: '#10b981', bg: 'rgba(16,185,129,0.15)' },
};

// ── Content Creator: Add/Edit Material Modal ───────────────────────────────────
function ContentModal({ item, onClose, onSave, courses }) {
    const [form, setForm] = useState(item || {
        title: '',
        type: 'article',
        courseId: courses[0]?.id || '',
        status: 'draft',
        duration: '',
        content: '',
        summary: '',
    });

    const handleSave = () => {
        if (!form.title.trim()) return;
        const course = courses.find(c => c.id === Number(form.courseId));
        onSave({ ...form, courseName: course?.title || '' });
        onClose();
    };

    const config = CONTENT_TYPES[form.type] || CONTENT_TYPES.article;

    return (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="modal" style={{ maxWidth: 640 }}>
                <div className="modal-header">
                    <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: config.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: config.color }}>
                            {config.icon}
                        </div>
                        {item ? 'Edit Material' : 'Create New Material'}
                    </div>
                    <button className="modal-close" onClick={onClose}><X size={16} /></button>
                </div>

                <div className="grid-2">
                    <div className="form-group">
                        <label className="form-label">Title *</label>
                        <input className="form-input" placeholder="e.g. Introduction to React Hooks"
                            value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Content Type</label>
                        <select className="form-select" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                            {Object.entries(CONTENT_TYPES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                        </select>
                    </div>
                </div>

                <div className="grid-2">
                    <div className="form-group">
                        <label className="form-label">Course</label>
                        {courses.length === 0
                            ? <div style={{ fontSize: 13, color: '#fbbf24', padding: '8px 0' }}>⚠ No published courses available.</div>
                            : <select className="form-select" value={form.courseId}
                                onChange={e => setForm({ ...form, courseId: Number(e.target.value) })}>
                                {courses.map(c => <option key={c.id} value={c.id}>{c.title.slice(0, 36)}</option>)}
                            </select>
                        }
                    </div>
                    <div className="form-group">
                        <label className="form-label">Status</label>
                        <select className="form-select" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                            {['draft', 'review', 'published'].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                        </select>
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label">Quick Summary</label>
                    <input className="form-input" placeholder="One-line summary of this material…"
                        value={form.summary} onChange={e => setForm({ ...form, summary: e.target.value })} />
                </div>

                <div className="form-group">
                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <PenLine size={14} /> Material Content
                    </label>
                    <textarea className="form-textarea"
                        placeholder="Write the full content here — explanations, examples, concepts, step-by-step instructions…"
                        value={form.content}
                        onChange={e => setForm({ ...form, content: e.target.value })}
                        style={{ minHeight: 200, lineHeight: 1.8 }} />
                </div>

                <div className="form-group">
                    <label className="form-label">Estimated Read / Study Time</label>
                    <input className="form-input" placeholder="e.g. 15 min read, 30 min practice"
                        value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} />
                </div>

                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                    <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
                    <button className="btn btn-primary" onClick={handleSave} disabled={!form.title.trim()}>
                        <Check size={15} /> {item ? 'Save Changes' : 'Publish Material'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Expanded Content View Card ──────────────────────────────────────────────────
function ContentCard({ item, isCreator, onEdit, onDelete, onTogglePublish }) {
    const [expanded, setExpanded] = useState(false);
    const config = CONTENT_TYPES[item.type] || CONTENT_TYPES.article;
    const statusColors = { published: 'badge-success', draft: 'badge-neutral', review: 'badge-warning' };

    return (
        <div className="card" style={{ padding: 0, overflow: 'hidden', transition: 'all 0.2s' }}>
            {/* Header */}
            <div style={{ padding: '16px 20px', background: config.bg, display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: `${config.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: config.color }}>
                    {config.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginTop: 2 }}>
                        <span><BookOpen size={10} /> {item.courseName || '—'}</span>
                        {item.duration && <span><Clock size={10} /> {item.duration}</span>}
                        <span><User size={10} /> {item.createdByName || 'Content Creator'}</span>
                    </div>
                </div>
                <span className={`badge ${statusColors[item.status]}`}>{item.status}</span>
            </div>

            {/* Summary */}
            {item.summary && (
                <div style={{ padding: '10px 20px', borderBottom: '1px solid var(--border-light)', fontSize: 13, color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                    {item.summary}
                </div>
            )}

            {/* Expanded content */}
            {expanded && item.content && (
                <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-light)', background: 'var(--bg-surface)' }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 10 }}>
                        Material Content
                    </div>
                    <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.9, whiteSpace: 'pre-wrap', wordBreak: 'break-word', maxHeight: 400, overflowY: 'auto' }}>
                        {item.content}
                    </div>
                </div>
            )}

            {/* Footer */}
            <div style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '7px', borderRadius: 8, background: 'var(--bg-surface)', border: '1px solid var(--border-light)', cursor: 'pointer', fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'Inter', transition: 'all 0.2s' }}
                    onClick={() => setExpanded(e => !e)}
                >
                    <Eye size={13} />
                    {expanded ? 'Hide Content' : 'Read Content'}
                    {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                </button>

                {isCreator && (
                    <>
                        <button className="btn btn-secondary btn-sm" style={{ fontSize: 11 }}
                            onClick={() => onTogglePublish(item.id, item.status)}>
                            {item.status === 'published' ? 'Unpublish' : 'Publish'}
                        </button>
                        <button className="btn-icon btn-sm" onClick={() => onEdit(item)}><Edit2 size={13} /></button>
                        <button className="btn-icon btn-sm" onClick={() => onDelete(item.id)} style={{ color: 'var(--danger)' }}><Trash2 size={13} /></button>
                    </>
                )}
            </div>
        </div>
    );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function ContentPage() {
    const { currentUser, contentItems, addContent, updateContent, deleteContent, courses } = useApp();

    const isContentCreator = currentUser.role === ROLES.CONTENT_CREATOR;
    const isStudent = currentUser.role === ROLES.STUDENT;

    const [showModal, setShowModal] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [filterType, setFilterType] = useState('all');
    const [filterStatus, setFilterStatus] = useState(isStudent ? 'published' : 'all');
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [search, setSearch] = useState('');

    // Students see only published content; creators see their own; others see all published
    const baseItems = isContentCreator
        ? contentItems.filter(ci => ci.createdBy === currentUser.id)
        : contentItems.filter(ci => ci.status === 'published');

    const filtered = baseItems.filter(c => {
        if (filterType !== 'all' && c.type !== filterType) return false;
        if (filterStatus !== 'all' && c.status !== filterStatus) return false;
        if (search && !c.title.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    });

    const handleTogglePublish = (id, currentStatus) => {
        updateContent(id, { status: currentStatus === 'published' ? 'draft' : 'published' });
    };

    // Published courses for content creator's dropdown
    const publishedCourses = courses.filter(c => c.status === 'published');

    return (
        <div className="animate-fadeIn">
            {/* Header */}
            <div className="page-header">
                <div>
                    <div className="page-title">
                        {isContentCreator ? 'My Content Library' : 'Study Materials'}
                    </div>
                    <div className="page-subtitle">
                        {isContentCreator
                            ? `${baseItems.length} item${baseItems.length !== 1 ? 's' : ''} you created`
                            : `${filtered.length} material${filtered.length !== 1 ? 's' : ''} available`}
                    </div>
                </div>
                {isContentCreator && (
                    <button className="btn btn-primary" onClick={() => { setEditItem(null); setShowModal(true); }}>
                        <Plus size={16} /> Create Material
                    </button>
                )}
            </div>

            {/* Summary Cards */}
            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 24 }}>
                {Object.entries(CONTENT_TYPES).map(([key, config]) => (
                    <div key={key} className="stat-card" style={{ cursor: 'pointer', border: filterType === key ? `1px solid ${config.color}` : undefined }}
                        onClick={() => setFilterType(filterType === key ? 'all' : key)}>
                        <div className="stat-icon" style={{ background: config.bg, color: config.color }}>{config.icon}</div>
                        <div className="stat-value">{baseItems.filter(c => c.type === key).length}</div>
                        <div className="stat-label">{config.label}s</div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ position: 'relative' }}>
                    <input className="form-input" style={{ paddingLeft: 36, width: 260 }}
                        placeholder="Search materials..." value={search}
                        onChange={e => setSearch(e.target.value)} />
                    <Filter size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                </div>
                {isContentCreator && (
                    <select className="form-select" style={{ width: 'auto', padding: '9px 14px' }}
                        value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                        <option value="all">All Status</option>
                        {['published', 'draft', 'review'].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                    </select>
                )}
            </div>

            {/* Content Cards */}
            {filtered.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
                    {filtered.map(item => (
                        <ContentCard
                            key={item.id}
                            item={item}
                            isCreator={isContentCreator}
                            onEdit={setEditItem}
                            onDelete={setDeleteConfirm}
                            onTogglePublish={handleTogglePublish}
                        />
                    ))}
                </div>
            ) : (
                <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-muted)' }}>
                    <Package size={52} style={{ opacity: 0.3, marginBottom: 16 }} />
                    <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8, color: 'var(--text-secondary)' }}>
                        {isContentCreator ? 'No materials yet' : 'No study materials available'}
                    </div>
                    <div style={{ fontSize: 14 }}>
                        {isContentCreator
                            ? 'Click "Create Material" to write your first educational content.'
                            : 'Content Creators will upload study materials here.'}
                    </div>
                    {isContentCreator && (
                        <button className="btn btn-primary" style={{ marginTop: 20 }}
                            onClick={() => { setEditItem(null); setShowModal(true); }}>
                            <Plus size={16} /> Create First Material
                        </button>
                    )}
                </div>
            )}

            {/* Create/Edit Modal */}
            {showModal && (
                <ContentModal
                    item={editItem}
                    courses={publishedCourses}
                    onClose={() => { setShowModal(false); setEditItem(null); }}
                    onSave={data => {
                        if (editItem) updateContent(editItem.id, data);
                        else addContent(data);
                        setShowModal(false);
                        setEditItem(null);
                    }}
                />
            )}

            {/* Edit trigger from ContentCard */}
            {editItem && !showModal && (
                <ContentModal
                    item={editItem}
                    courses={publishedCourses}
                    onClose={() => setEditItem(null)}
                    onSave={data => { updateContent(editItem.id, data); setEditItem(null); }}
                />
            )}

            {/* Delete Confirm */}
            {deleteConfirm && (
                <div className="modal-overlay">
                    <div className="modal" style={{ maxWidth: 380, textAlign: 'center' }}>
                        <Trash2 size={36} style={{ color: 'var(--danger)', margin: '0 auto 16px' }} />
                        <div className="modal-title" style={{ marginBottom: 8 }}>Delete Material?</div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>This cannot be undone.</p>
                        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                            <button className="btn btn-secondary" onClick={() => setDeleteConfirm(null)}>Cancel</button>
                            <button className="btn btn-danger" onClick={() => { deleteContent(deleteConfirm); setDeleteConfirm(null); }}>Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
