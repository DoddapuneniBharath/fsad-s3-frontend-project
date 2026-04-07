import { useState } from 'react';
import { useApp, ROLES } from '../context/AppContext';
import {
    Plus, Edit2, Trash2, Search, Users, Clock, BookOpen,
    PlayCircle, X, Check, Lock, Eye, CheckCircle2, Circle,
    GraduationCap, Star, Award, ChevronLeft, ListOrdered,
} from 'lucide-react';

// ── Instructor: Create / Edit Course Modal ─────────────────────────────────────
function CourseModal({ course, onClose, onSave }) {
    const [form, setForm] = useState(course || {
        title: '', category: 'Development', level: 'Beginner',
        duration: '', description: '', status: 'published', lessons: 0,
        tags: '', syllabus: '', instructorBio: '',
    });

    const categories = ['Development', 'Design', 'Data Science', 'AI & ML', 'Mathematics', 'Science', 'Photography', 'Mobile', 'Business'];
    const levels = ['Beginner', 'Intermediate', 'Advanced'];

    const handleSave = () => {
        if (!form.title.trim()) return;
        const tagsArr = typeof form.tags === 'string'
            ? form.tags.split(',').map(t => t.trim()).filter(Boolean)
            : form.tags;
        // Parse syllabus: one topic per line → array
        const syllabusArr = typeof form.syllabus === 'string'
            ? form.syllabus.split('\n').map(t => t.trim()).filter(Boolean)
            : form.syllabus;
        onSave({ ...form, tags: tagsArr, lessons: Number(form.lessons) || 0, syllabus: syllabusArr });
        onClose();
    };

    // For editing: convert syllabus array back to newline-separated string
    const syllabusText = Array.isArray(form.syllabus)
        ? form.syllabus.join('\n')
        : (form.syllabus || '');

    return (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="modal" style={{ maxWidth: 620, maxHeight: '90vh', overflowY: 'auto' }}>
                <div className="modal-header">
                    <div className="modal-title">{course ? 'Edit Course' : '+ Create New Course'}</div>
                    <button className="modal-close" onClick={onClose}><X size={16} /></button>
                </div>

                <div className="form-group">
                    <label className="form-label">Course Title *</label>
                    <input className="form-input" placeholder="e.g. Full-Stack Web Development"
                        value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
                </div>

                <div className="grid-2">
                    <div className="form-group">
                        <label className="form-label">Category</label>
                        <select className="form-select" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                            {categories.map(c => <option key={c}>{c}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Level</label>
                        <select className="form-select" value={form.level} onChange={e => setForm({ ...form, level: e.target.value })}>
                            {levels.map(l => <option key={l}>{l}</option>)}
                        </select>
                    </div>
                </div>

                <div className="grid-2">
                    <div className="form-group">
                        <label className="form-label">Duration (e.g. 24h)</label>
                        <input className="form-input" placeholder="e.g. 32h" value={form.duration}
                            onChange={e => setForm({ ...form, duration: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">No. of Lessons</label>
                        <input className="form-input" type="number" min="0" placeholder="0" value={form.lessons}
                            onChange={e => setForm({ ...form, lessons: e.target.value })} />
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label">Tags (comma separated)</label>
                    <input className="form-input" placeholder="e.g. React, Node.js"
                        value={Array.isArray(form.tags) ? form.tags.join(', ') : form.tags}
                        onChange={e => setForm({ ...form, tags: e.target.value })} />
                </div>

                <div className="form-group">
                    <label className="form-label">Course Description</label>
                    <textarea className="form-textarea" placeholder="What will students learn? Describe the course goals and outcomes…"
                        value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                        style={{ minHeight: 90 }} />
                </div>

                <div className="form-group">
                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <ListOrdered size={14} /> Syllabus Topics <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 400 }}>(one lesson per line)</span>
                    </label>
                    <textarea className="form-textarea"
                        placeholder={"Network Fundamentals\nOSI and TCP/IP Models\nRouting and Switching\nNetwork Security\nWireless Networks\nCloud Networking"}
                        value={syllabusText}
                        onChange={e => setForm({ ...form, syllabus: e.target.value })}
                        style={{ minHeight: 140, fontFamily: 'Inter', lineHeight: 1.8 }} />
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Each line becomes a numbered lesson in the student's Syllabus tab.</div>
                </div>

                <div className="form-group">
                    <label className="form-label">Instructor Bio</label>
                    <textarea className="form-textarea"
                        placeholder="Brief bio about yourself — your experience, expertise, and teaching style…"
                        value={form.instructorBio || ''}
                        onChange={e => setForm({ ...form, instructorBio: e.target.value })}
                        style={{ minHeight: 80 }} />
                </div>

                <div className="form-group">
                    <label className="form-label">Visibility</label>
                    <select className="form-select" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                        <option value="published">Published — visible to enrolled students</option>
                        <option value="draft">Draft — hidden from students</option>
                    </select>
                </div>

                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                    <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
                    <button className="btn btn-primary" onClick={handleSave} disabled={!form.title.trim()}>
                        <Check size={15} /> {course ? 'Save Changes' : 'Create Course'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Enrolled Student: Full Course Viewer (tabbed) ──────────────────────────────
function EnrolledCourseViewer({ course, onClose, completedLessons, onToggleLesson }) {
    const [tab, setTab] = useState('overview');

    const syllabus = Array.isArray(course.syllabus) ? course.syllabus : [];
    const completedCount = syllabus.filter((_, i) => completedLessons.has(i)).length;
    const progress = syllabus.length > 0 ? Math.round((completedCount / syllabus.length) * 100) : 0;

    const tabStyle = (t) => ({
        flex: 1, padding: '12px 0', background: tab === t ? '#fff' : 'transparent',
        border: 'none', borderRadius: 10, cursor: 'pointer',
        fontFamily: 'Inter', fontSize: 14, fontWeight: tab === t ? 700 : 500,
        color: tab === t ? 'var(--primary)' : 'var(--text-muted)',
        transition: 'all 0.2s',
        boxShadow: tab === t ? '0 2px 8px rgba(108,99,255,0.15)' : 'none',
    });

    return (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="modal" style={{ maxWidth: 680, maxHeight: '92vh', overflowY: 'hidden', display: 'flex', flexDirection: 'column', padding: 0 }}>

                {/* Course Header Banner */}
                <div style={{ height: 160, background: course.thumb.gradient, position: 'relative', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 70 }}>{course.thumb.icon}</span>
                    <button onClick={onClose} style={{
                        position: 'absolute', top: 14, right: 14,
                        background: 'rgba(0,0,0,0.3)', border: 'none', borderRadius: '50%',
                        width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', color: '#fff',
                    }}>
                        <X size={16} />
                    </button>
                    {progress > 0 && (
                        <div style={{ position: 'absolute', bottom: 14, left: 20, right: 20 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.85)', fontWeight: 600 }}>Progress</span>
                                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.85)', fontWeight: 700 }}>{progress}%</span>
                            </div>
                            <div style={{ height: 5, background: 'rgba(255,255,255,0.25)', borderRadius: 10, overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: `${progress}%`, background: '#fff', borderRadius: 10, transition: 'width 0.4s ease' }} />
                            </div>
                        </div>
                    )}
                </div>

                {/* Title & Meta */}
                <div style={{ padding: '18px 24px 0', flexShrink: 0, borderBottom: '1px solid var(--border-light)', paddingBottom: 16 }}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>{course.title}</div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <span className="badge badge-primary">{course.category}</span>
                        <span className="badge badge-neutral">{course.level}</span>
                        {course.duration && <span className="badge badge-neutral"><Clock size={10} /> {course.duration}</span>}
                        <span className="badge badge-success"><Check size={10} /> Enrolled</span>
                    </div>
                </div>

                {/* Tab Bar */}
                <div style={{ padding: '10px 24px', flexShrink: 0, borderBottom: '1px solid var(--border-light)' }}>
                    <div style={{ display: 'flex', gap: 4, background: 'var(--bg-surface)', borderRadius: 12, padding: 4 }}>
                        <button style={tabStyle('overview')} onClick={() => setTab('overview')}>Overview</button>
                        <button style={tabStyle('syllabus')} onClick={() => setTab('syllabus')}>
                            Syllabus {syllabus.length > 0 && <span style={{ marginLeft: 4, fontSize: 11, background: 'rgba(108,99,255,0.15)', color: 'var(--primary)', padding: '1px 6px', borderRadius: 20 }}>{syllabus.length}</span>}
                        </button>
                        <button style={tabStyle('instructor')} onClick={() => setTab('instructor')}>Instructor</button>
                    </div>
                </div>

                {/* Tab Content (scrollable) */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>

                    {/* ── Overview Tab ── */}
                    {tab === 'overview' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                            {/* Stats row */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                                {[
                                    { icon: <Users size={16} />, label: `${course.students} enrolled` },
                                    { icon: <BookOpen size={16} />, label: `${course.lessons || syllabus.length || 0} lessons` },
                                    { icon: <Clock size={16} />, label: course.duration || '—' },
                                ].map((item, i) => (
                                    <div key={i} style={{ background: 'var(--bg-surface)', borderRadius: 10, padding: 14, textAlign: 'center', border: '1px solid var(--border-light)' }}>
                                        <div style={{ color: 'var(--primary)', marginBottom: 4, display: 'flex', justifyContent: 'center' }}>{item.icon}</div>
                                        <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>{item.label}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Description */}
                            <div>
                                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>About this Course</div>
                                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.8, margin: 0 }}>
                                    {course.description || 'No description provided.'}
                                </p>
                            </div>

                            {/* Tags */}
                            {course.tags?.length > 0 && (
                                <div>
                                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>Topics Covered</div>
                                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                        {course.tags.map(t => <span key={t} className="badge badge-secondary" style={{ fontSize: 12, padding: '4px 10px' }}>{t}</span>)}
                                    </div>
                                </div>
                            )}

                            {/* Progress summary */}
                            {syllabus.length > 0 && (
                                <div style={{ padding: 16, background: 'rgba(108,99,255,0.06)', borderRadius: 12, border: '1px solid rgba(108,99,255,0.15)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                                        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Your Progress</div>
                                        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)' }}>{completedCount}/{syllabus.length} lessons done</div>
                                    </div>
                                    <div style={{ height: 8, background: 'var(--bg-elevated)', borderRadius: 10, overflow: 'hidden' }}>
                                        <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg, var(--primary), #06b6d4)', borderRadius: 10, transition: 'width 0.4s ease' }} />
                                    </div>
                                    {progress === 100 && (
                                        <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 8, color: '#34d399', fontSize: 13, fontWeight: 600 }}>
                                            <Award size={16} /> 🎉 Course Complete! Great work!
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── Syllabus Tab ── */}
                    {tab === 'syllabus' && (
                        <div>
                            {syllabus.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
                                    <BookOpen size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
                                    <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>No syllabus yet</div>
                                    <div style={{ fontSize: 13 }}>The instructor hasn't added lessons yet. Check back later.</div>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>
                                        Click the circle to mark a lesson complete.
                                    </div>
                                    {syllabus.map((topic, i) => {
                                        const done = completedLessons.has(i);
                                        return (
                                            <div
                                                key={i}
                                                onClick={() => onToggleLesson(i)}
                                                style={{
                                                    display: 'flex', alignItems: 'center', gap: 16,
                                                    padding: '14px 16px', borderRadius: 12,
                                                    background: done ? 'rgba(16,185,129,0.06)' : 'var(--bg-surface)',
                                                    border: `1px solid ${done ? 'rgba(16,185,129,0.25)' : 'var(--border-light)'}`,
                                                    cursor: 'pointer', transition: 'all 0.2s',
                                                }}
                                                onMouseEnter={e => { if (!done) e.currentTarget.style.background = 'var(--bg-elevated)'; }}
                                                onMouseLeave={e => { e.currentTarget.style.background = done ? 'rgba(16,185,129,0.06)' : 'var(--bg-surface)'; }}
                                            >
                                                {/* Numbered bubble */}
                                                <div style={{
                                                    width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    background: done ? '#34d399' : 'var(--primary)',
                                                    color: '#fff', fontSize: 13, fontWeight: 700,
                                                    transition: 'background 0.2s',
                                                }}>
                                                    {done ? <Check size={14} /> : i + 1}
                                                </div>

                                                {/* Topic name */}
                                                <div style={{ flex: 1, fontSize: 14, fontWeight: 500, color: done ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: done ? 'line-through' : 'none', transition: 'all 0.2s' }}>
                                                    {topic}
                                                </div>

                                                {/* Completion icon */}
                                                <div style={{ color: done ? '#34d399' : 'var(--border-light)', transition: 'color 0.2s' }}>
                                                    {done ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── Instructor Tab ── */}
                    {tab === 'instructor' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                            {/* Instructor card */}
                            <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', padding: 20, background: 'var(--bg-surface)', borderRadius: 14, border: '1px solid var(--border-light)' }}>
                                <div style={{
                                    width: 64, height: 64, borderRadius: '50%', flexShrink: 0,
                                    background: 'linear-gradient(135deg, var(--primary), #06b6d4)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 22, fontWeight: 700, color: '#fff',
                                }}>
                                    {course.createdByName ? course.createdByName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'IN'}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                                        {course.createdByName || 'Instructor'}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                                        <span className="badge badge-primary" style={{ fontSize: 11 }}><GraduationCap size={10} /> Instructor</span>
                                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>• {course.category} Expert</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text-muted)' }}>
                                        <span><BookOpen size={11} /> {course.lessons || (Array.isArray(course.syllabus) ? course.syllabus.length : 0)} lessons</span>
                                        <span><Users size={11} /> {course.students} students</span>
                                        <span><Star size={11} /> {course.category}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Bio */}
                            <div>
                                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>About the Instructor</div>
                                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.8, margin: 0 }}>
                                    {course.instructorBio || `${course.createdByName || 'This instructor'} is an experienced educator passionate about ${course.category}. They bring real-world expertise and practical knowledge to help students master the subject from fundamentals to advanced concepts.`}
                                </p>
                            </div>

                            {/* Course by this instructor */}
                            <div style={{ padding: 16, background: 'var(--bg-surface)', borderRadius: 12, border: '1px solid var(--border-light)' }}>
                                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>About this Course</div>
                                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>{course.title}</div>
                                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{course.category} · {course.level} · {course.duration || 'Self-paced'}</div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                        {syllabus.length > 0 ? `${completedCount}/${syllabus.length} lessons completed` : 'Enrolled & learning'}
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                        <button className="btn btn-secondary" onClick={onClose}>Close</button>
                        <button className="btn btn-primary" onClick={() => setTab('syllabus')}>
                            <PlayCircle size={14} /> Continue Learning
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── Pre-Enroll: Course Preview Modal (not yet enrolled) ────────────────────────
function CoursePreviewModal({ course, onEnroll, onClose }) {
    const [tab, setTab] = useState('overview');
    const syllabus = Array.isArray(course.syllabus) ? course.syllabus : [];

    const tabStyle = (t) => ({
        flex: 1, padding: '11px 0', background: tab === t ? '#fff' : 'transparent',
        border: 'none', borderRadius: 10, cursor: 'pointer',
        fontFamily: 'Inter', fontSize: 13, fontWeight: tab === t ? 700 : 500,
        color: tab === t ? 'var(--primary)' : 'var(--text-muted)',
        transition: 'all 0.2s',
        boxShadow: tab === t ? '0 2px 8px rgba(108,99,255,0.15)' : 'none',
    });

    return (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="modal" style={{ maxWidth: 640, maxHeight: '90vh', overflowY: 'hidden', display: 'flex', flexDirection: 'column', padding: 0 }}>

                {/* Banner */}
                <div style={{ height: 150, background: course.thumb.gradient, position: 'relative', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 64 }}>{course.thumb.icon}</span>
                    <button onClick={onClose} style={{ position: 'absolute', top: 14, right: 14, background: 'rgba(0,0,0,0.3)', border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}>
                        <X size={16} />
                    </button>
                </div>

                {/* Title */}
                <div style={{ padding: '16px 24px 12px', borderBottom: '1px solid var(--border-light)', flexShrink: 0 }}>
                    <div style={{ fontSize: 19, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>{course.title}</div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                        <span className="badge badge-primary">{course.category}</span>
                        <span className="badge badge-neutral">{course.level}</span>
                        {course.duration && <span className="badge badge-neutral"><Clock size={10} /> {course.duration}</span>}
                        <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 4 }}>by {course.createdByName || 'Instructor'}</span>
                    </div>
                </div>

                {/* Tabs */}
                <div style={{ padding: '10px 24px', flexShrink: 0, borderBottom: '1px solid var(--border-light)' }}>
                    <div style={{ display: 'flex', gap: 4, background: 'var(--bg-surface)', borderRadius: 12, padding: 4 }}>
                        <button style={tabStyle('overview')} onClick={() => setTab('overview')}>Overview</button>
                        <button style={tabStyle('syllabus')} onClick={() => setTab('syllabus')}>
                            Syllabus {syllabus.length > 0 && <span style={{ marginLeft: 4, fontSize: 11, background: 'rgba(108,99,255,0.15)', color: 'var(--primary)', padding: '1px 6px', borderRadius: 20 }}>{syllabus.length}</span>}
                        </button>
                        <button style={tabStyle('instructor')} onClick={() => setTab('instructor')}>Instructor</button>
                    </div>
                </div>

                {/* Content */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
                    {tab === 'overview' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                                {[
                                    { icon: <Users size={16} />, label: `${course.students} enrolled` },
                                    { icon: <BookOpen size={16} />, label: `${course.lessons || syllabus.length || 0} lessons` },
                                    { icon: <Clock size={16} />, label: course.duration || '—' },
                                ].map((item, i) => (
                                    <div key={i} style={{ background: 'var(--bg-surface)', borderRadius: 10, padding: 12, textAlign: 'center', border: '1px solid var(--border-light)' }}>
                                        <div style={{ color: 'var(--primary)', marginBottom: 4, display: 'flex', justifyContent: 'center' }}>{item.icon}</div>
                                        <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{item.label}</div>
                                    </div>
                                ))}
                            </div>
                            <div>
                                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>About this Course</div>
                                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.8, margin: 0 }}>{course.description || 'No description provided.'}</p>
                            </div>
                            {course.tags?.length > 0 && (
                                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                    {course.tags.map(t => <span key={t} className="badge badge-secondary">{t}</span>)}
                                </div>
                            )}
                        </div>
                    )}

                    {tab === 'syllabus' && (
                        <div>
                            {syllabus.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--text-muted)' }}>
                                    <BookOpen size={36} style={{ opacity: 0.3, marginBottom: 12 }} />
                                    <div style={{ fontSize: 14 }}>No syllabus published yet.</div>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>Enroll to track your progress through these lessons.</div>
                                    {syllabus.map((topic, i) => (
                                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '13px 16px', borderRadius: 12, background: 'var(--bg-surface)', border: '1px solid var(--border-light)' }}>
                                            <div style={{ width: 30, height: 30, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--primary)', color: '#fff', fontSize: 12, fontWeight: 700 }}>
                                                {i + 1}
                                            </div>
                                            <div style={{ flex: 1, fontSize: 14, color: 'var(--text-primary)', fontWeight: 500 }}>{topic}</div>
                                            <Circle size={18} style={{ color: 'var(--border-light)' }} />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {tab === 'instructor' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', padding: 18, background: 'var(--bg-surface)', borderRadius: 14, border: '1px solid var(--border-light)' }}>
                                <div style={{ width: 56, height: 56, borderRadius: '50%', flexShrink: 0, background: 'linear-gradient(135deg, var(--primary), #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, color: '#fff' }}>
                                    {course.createdByName ? course.createdByName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'IN'}
                                </div>
                                <div>
                                    <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{course.createdByName || 'Instructor'}</div>
                                    <span className="badge badge-primary" style={{ fontSize: 11 }}><GraduationCap size={10} /> Instructor</span>
                                </div>
                            </div>
                            <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.8, margin: 0 }}>
                                {course.instructorBio || `${course.createdByName || 'This instructor'} is an experienced educator passionate about ${course.category}. Enroll to start learning today!`}
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'flex-end', gap: 10, flexShrink: 0 }}>
                    <button className="btn btn-secondary" onClick={onClose}>Close</button>
                    <button className="btn btn-primary btn-lg" onClick={() => { onEnroll(); onClose(); }} style={{ fontWeight: 700 }}>
                        <GraduationCap size={16} /> Enroll Now — It's Free!
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Admin: View-only Course Detail Modal ──────────────────────────────────────
function AdminCourseViewModal({ course, onClose, onDelete }) {
    const syllabus = Array.isArray(course.syllabus) ? course.syllabus : [];

    return (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="modal" style={{ maxWidth: 620 }}>
                <div style={{ height: 140, background: course.thumb.gradient, borderRadius: 12, marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 60 }}>
                    {course.thumb.icon}
                </div>
                <div className="modal-header" style={{ marginBottom: 12 }}>
                    <div className="modal-title" style={{ fontSize: 18 }}>{course.title}</div>
                    <button className="modal-close" onClick={onClose}><X size={16} /></button>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
                    <span className="badge badge-primary">{course.category}</span>
                    <span className="badge badge-neutral">{course.level}</span>
                    <span className={`badge ${course.status === 'published' ? 'badge-success' : 'badge-neutral'}`}>{course.status}</span>
                    <span className="badge badge-neutral">By {course.createdByName || 'Instructor'}</span>
                </div>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 16 }}>
                    {course.description || 'No description provided.'}
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
                    {[
                        { icon: <Users size={16} />, label: `${course.students} enrolled` },
                        { icon: <BookOpen size={16} />, label: `${course.lessons || syllabus.length || 0} lessons` },
                        { icon: <Clock size={16} />, label: course.duration || '—' },
                    ].map((item, i) => (
                        <div key={i} style={{ background: 'var(--bg-surface)', borderRadius: 10, padding: 12, textAlign: 'center', border: '1px solid var(--border-light)' }}>
                            <div style={{ color: 'var(--primary-light)', marginBottom: 4, display: 'flex', justifyContent: 'center' }}>{item.icon}</div>
                            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{item.label}</div>
                        </div>
                    ))}
                </div>
                {syllabus.length > 0 && (
                    <div style={{ marginBottom: 16 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>Syllabus ({syllabus.length} lessons)</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 200, overflowY: 'auto' }}>
                            {syllabus.map((t, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: 'var(--bg-surface)', borderRadius: 8, fontSize: 13 }}>
                                    <span style={{ width: 22, height: 22, background: 'var(--primary)', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{i + 1}</span>
                                    <span style={{ color: 'var(--text-secondary)' }}>{t}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                    <button className="btn btn-secondary" onClick={onClose}>Close</button>
                    <button className="btn btn-danger" onClick={() => { onDelete(course.id); onClose(); }}>
                        <Trash2 size={14} /> Delete Course
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
// view = 'browse'      → All published courses (sidebar: Browse Courses)
// view = 'my-learning' → Only enrolled courses (sidebar: My Learning)
export default function CoursesPage({ view = 'browse' }) {
    const {
        currentUser, courses,
        addCourse, updateCourse, deleteCourse,
        getInstructorCourses, getPublishedCourses, getEnrolledCourses,
        enrollStudent, isEnrolled,
    } = useApp();

    const [showModal, setShowModal] = useState(false);
    const [editCourse, setEditCourse] = useState(null);
    const [viewCourse, setViewCourse] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [search, setSearch] = useState('');
    const [filterCategory, setFilterCategory] = useState('All');

    // Lesson completion tracking: { courseId: Set<lessonIndex> }
    // This is the ONLY source of progress — no random/hardcoded values
    const [completedMap, setCompletedMap] = useState({});

    const isAdmin = currentUser.role === ROLES.ADMIN;
    const isInstructor = currentUser.role === ROLES.INSTRUCTOR;
    const isStudent = currentUser.role === ROLES.STUDENT;
    const isContentCreator = currentUser.role === ROLES.CONTENT_CREATOR;

    // ── Determine which courses to show ────────────────────────────────────────
    const allPublished = getPublishedCourses();
    const enrolledCourses = isStudent ? getEnrolledCourses(currentUser.id) : [];

    let poolCourses;
    if (isInstructor) {
        poolCourses = getInstructorCourses(currentUser.id);
    } else if (isAdmin) {
        poolCourses = courses; // Admins see everything
    } else if (isStudent && view === 'my-learning') {
        poolCourses = enrolledCourses; // My Learning → enrolled only
    } else {
        poolCourses = allPublished; // Browse Courses → all published (enrolled or not)
    }

    // Apply search + category filters
    const displayCourses = poolCourses.filter(c => {
        if (search && !c.title.toLowerCase().includes(search.toLowerCase())) return false;
        if (filterCategory !== 'All' && c.category !== filterCategory) return false;
        return true;
    });

    const categories = ['All', ...new Set(poolCourses.map(c => c.category))];

    // ── Progress helpers ────────────────────────────────────────────────────────
    const getCompletedLessons = (courseId) => completedMap[courseId] || new Set();

    const handleToggleLesson = (courseId, lessonIndex) => {
        setCompletedMap(prev => {
            const existing = new Set(prev[courseId] || []);
            if (existing.has(lessonIndex)) existing.delete(lessonIndex);
            else existing.add(lessonIndex);
            return { ...prev, [courseId]: existing };
        });
    };

    // ── Page title / subtitle ───────────────────────────────────────────────────
    const pageTitle = isInstructor ? 'My Courses'
        : isAdmin ? 'All Courses'
            : view === 'my-learning' ? 'My Learning'
                : 'Browse Courses';

    const pageSubtitle = isInstructor
        ? `${poolCourses.length} course${poolCourses.length !== 1 ? 's' : ''} you created`
        : isAdmin
            ? `${courses.length} total courses on the platform`
            : view === 'my-learning'
                ? `${enrolledCourses.length} enrolled course${enrolledCourses.length !== 1 ? 's' : ''}`
                : `${enrolledCourses.length} enrolled · ${allPublished.length} available`;

    // ── Empty state messages ────────────────────────────────────────────────────
    const emptyTitle = isInstructor ? 'No courses yet'
        : isAdmin ? 'No courses on the platform yet'
            : view === 'my-learning' ? "You haven't enrolled in any courses yet"
                : 'No courses available yet';

    const emptyHint = isInstructor ? 'Click "New Course" to create your first course.'
        : isAdmin ? 'Instructors will create courses here.'
            : view === 'my-learning' ? 'Go to Browse Courses and click Enroll Now on any course.'
                : 'Check back later — instructors are publishing courses soon.';

    return (
        <div className="animate-fadeIn">
            {/* Header */}
            <div className="page-header">
                <div>
                    <div className="page-title">{pageTitle}</div>
                    <div className="page-subtitle">{pageSubtitle}</div>
                </div>
                {isInstructor && (
                    <button className="btn btn-primary" onClick={() => { setEditCourse(null); setShowModal(true); }}>
                        <Plus size={16} /> New Course
                    </button>
                )}
                {isAdmin && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 14px', background: 'rgba(239,68,68,0.1)', borderRadius: 20, border: '1px solid rgba(239,68,68,0.25)', fontSize: 12, color: '#f87171', fontWeight: 600 }}>
                        <Eye size={13} /> View-only · Admins can delete
                    </div>
                )}
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
                <div className="search-bar" style={{ maxWidth: 280 }}>
                    <Search size={15} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                    <input placeholder="Search courses…" value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {categories.slice(0, 8).map(cat => (
                        <button key={cat} onClick={() => setFilterCategory(cat)}
                            style={{ padding: '5px 12px', borderRadius: 20, fontSize: 12, fontFamily: 'Inter', cursor: 'pointer', border: filterCategory === cat ? 'none' : '1px solid var(--border-light)', background: filterCategory === cat ? 'var(--primary)' : 'var(--bg-card)', color: filterCategory === cat ? '#fff' : 'var(--text-secondary)', transition: 'all 0.2s' }}>
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Empty state */}
            {displayCourses.length === 0 && (
                <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-muted)' }}>
                    <BookOpen size={52} style={{ marginBottom: 16, opacity: 0.3 }} />
                    <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8, color: 'var(--text-secondary)' }}>{emptyTitle}</div>
                    <div style={{ fontSize: 14 }}>{emptyHint}</div>
                    {isInstructor && (
                        <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={() => { setEditCourse(null); setShowModal(true); }}>
                            <Plus size={16} /> Create First Course
                        </button>
                    )}
                </div>
            )}

            {/* Course Grid */}
            {displayCourses.length > 0 && (
                <div className="course-grid">
                    {displayCourses.map(course => {
                        const enrolled = isStudent && isEnrolled(currentUser.id, course.id);
                        const completed = getCompletedLessons(course.id);
                        const syllabus = Array.isArray(course.syllabus) ? course.syllabus : [];
                        // Progress = lessons checked / total lessons — 0 if none checked
                        const progress = (enrolled && syllabus.length > 0)
                            ? Math.round((completed.size / syllabus.length) * 100)
                            : 0;

                        return (
                            <div key={course.id} className="course-card" onClick={() => setViewCourse(course)}>
                                <div className="course-card-thumb">
                                    <div className="course-card-thumb-inner" style={{ background: course.thumb.gradient }}>
                                        <span style={{ fontSize: 48 }}>{course.thumb.icon}</span>
                                    </div>
                                    <div style={{ position: 'absolute', top: 10, right: 10, display: 'flex', gap: 6 }}>
                                        {(isInstructor || isAdmin) && (
                                            <span className={`badge ${course.status === 'published' ? 'badge-success' : 'badge-neutral'}`}>{course.status}</span>
                                        )}
                                        {enrolled && <span className="badge badge-primary">Enrolled ✓</span>}
                                    </div>
                                    {/* Progress bar — only shown when student has actually completed at least 1 lesson */}
                                    {enrolled && syllabus.length > 0 && completed.size > 0 && (
                                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 4, background: 'rgba(0,0,0,0.2)' }}>
                                            <div style={{ height: '100%', width: `${progress}%`, background: '#34d399', transition: 'width 0.4s', borderRadius: '0 4px 4px 0' }} />
                                        </div>
                                    )}
                                </div>

                                <div className="course-card-body">
                                    <div className="course-card-category" style={{ color: 'var(--primary-light)' }}>{course.category}</div>
                                    <div className="course-card-title">{course.title}</div>
                                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>by {course.createdByName || 'Instructor'}</div>
                                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                                        {course.tags?.slice(0, 2).map(t => (
                                            <span key={t} className="badge badge-secondary" style={{ fontSize: 10 }}>{t}</span>
                                        ))}
                                        <span className="badge badge-neutral" style={{ fontSize: 10 }}>{course.level}</span>
                                    </div>
                                    <div className="course-card-footer">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 12, color: 'var(--text-muted)' }}>
                                            <span><Users size={12} /> {course.students} students</span>
                                            {course.duration && <span><Clock size={12} /> {course.duration}</span>}
                                        </div>
                                        {isInstructor && (
                                            <div style={{ display: 'flex', gap: 6 }} onClick={e => e.stopPropagation()}>
                                                <button className="btn-icon btn-sm" title="Edit"
                                                    onClick={e => { e.stopPropagation(); setEditCourse(course); setShowModal(true); }}>
                                                    <Edit2 size={13} />
                                                </button>
                                                <button className="btn-icon btn-sm" title="Delete" style={{ color: 'var(--danger)' }}
                                                    onClick={e => { e.stopPropagation(); setDeleteConfirm(course.id); }}>
                                                    <Trash2 size={13} />
                                                </button>
                                            </div>
                                        )}
                                        {isAdmin && (
                                            <div onClick={e => e.stopPropagation()}>
                                                <button className="btn-icon btn-sm" title="Delete" style={{ color: 'var(--danger)' }}
                                                    onClick={e => { e.stopPropagation(); setDeleteConfirm(course.id); }}>
                                                    <Trash2 size={13} />
                                                </button>
                                            </div>
                                        )}
                                        {isStudent && (
                                            <span style={{ fontSize: 11, fontWeight: 600, color: enrolled ? '#34d399' : 'var(--text-muted)' }}>
                                                {enrolled
                                                    ? (completed.size > 0 && syllabus.length > 0
                                                        ? `${progress}% complete`
                                                        : '✓ Enrolled')
                                                    : 'Click to enroll →'}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Draft notice for instructor */}
            {isInstructor && poolCourses.some(c => c.status === 'draft') && (
                <div style={{ marginTop: 16, padding: '10px 16px', background: 'rgba(245,158,11,0.1)', borderRadius: 10, border: '1px solid rgba(245,158,11,0.25)', fontSize: 13, color: '#fbbf24', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Lock size={14} /> Draft courses are only visible to you. Publish them for students to see.
                </div>
            )}

            {/* ── Modals ── */}

            {/* Instructor: create */}
            {showModal && isInstructor && (
                <CourseModal
                    course={editCourse}
                    onClose={() => { setShowModal(false); setEditCourse(null); }}
                    onSave={async data => {
                        if (editCourse) await updateCourse(editCourse.id, data);
                        else await addCourse(data);
                        setShowModal(false); setEditCourse(null);
                    }}
                />
            )}

            {/* Instructor: click card → edit */}
            {viewCourse && !showModal && isInstructor && (
                <CourseModal
                    course={viewCourse}
                    onClose={() => setViewCourse(null)}
                    onSave={async data => { await updateCourse(viewCourse.id, data); setViewCourse(null); }}
                />
            )}

            {/* Admin: view + delete */}
            {viewCourse && isAdmin && (
                <AdminCourseViewModal
                    course={viewCourse}
                    onClose={() => setViewCourse(null)}
                    onDelete={id => { deleteCourse(id); setViewCourse(null); }}
                />
            )}

            {/* Student enrolled → full tabbed course viewer */}
            {viewCourse && isStudent && isEnrolled(currentUser.id, viewCourse.id) && (
                <EnrolledCourseViewer
                    course={viewCourse}
                    completedLessons={getCompletedLessons(viewCourse.id)}
                    onToggleLesson={i => handleToggleLesson(viewCourse.id, i)}
                    onClose={() => setViewCourse(null)}
                />
            )}

            {/* Student NOT enrolled → preview + enroll */}
            {viewCourse && isStudent && !isEnrolled(currentUser.id, viewCourse.id) && (
                <CoursePreviewModal
                    course={viewCourse}
                    onEnroll={() => enrollStudent(currentUser.id, viewCourse.id)}
                    onClose={() => setViewCourse(null)}
                />
            )}

            {/* Content Creator: read-only preview */}
            {viewCourse && isContentCreator && (
                <CoursePreviewModal
                    course={viewCourse}
                    onEnroll={() => { }}
                    onClose={() => setViewCourse(null)}
                />
            )}

            {/* Delete confirm */}
            {deleteConfirm && (
                <div className="modal-overlay">
                    <div className="modal" style={{ maxWidth: 420, textAlign: 'center' }}>
                        <Trash2 size={40} style={{ color: 'var(--danger)', margin: '0 auto 16px' }} />
                        <div className="modal-title" style={{ marginBottom: 8 }}>Delete Course?</div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>
                            All assignments and student submissions for this course will also be permanently deleted.
                        </p>
                        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                            <button className="btn btn-secondary" onClick={() => setDeleteConfirm(null)}>Cancel</button>
                            <button className="btn btn-danger" onClick={() => { deleteCourse(deleteConfirm); setDeleteConfirm(null); }}>
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
