import { useApp, ROLES } from '../context/AppContext';
import { BookMarked, GraduationCap, FileText, Upload, Star, Clock, Package, PenLine, Users, Shield, BookOpen } from 'lucide-react';

function StatCard({ icon, label, value, color, sub }) {
    return (
        <div className="stat-card">
            <div className="stat-icon" style={{ background: `${color}20` }}>
                <span style={{ color }}>{icon}</span>
            </div>
            <div className="stat-value">{value}</div>
            <div className="stat-label">{label}</div>
            {sub && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{sub}</div>}
        </div>
    );
}

// ── Admin Dashboard ────────────────────────────────────────────────────────────
function AdminDashboard() {
    const { users, courses, announcements } = useApp();

    const totalStudents = users.filter(u => u.role === ROLES.STUDENT && u.status === 'active').length;
    const totalInstructors = users.filter(u => u.role === ROLES.INSTRUCTOR && u.status === 'active').length;
    const totalCourses = courses.length;
    const publishedCourses = courses.filter(c => c.status === 'published').length;

    return (
        <div className="animate-fadeIn">
            <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' }}>Admin Overview</div>
                <div style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>Platform management & monitoring</div>
            </div>

            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                <StatCard icon={<Users size={22} />} label="Total Users" value={users.length} color="#6c63ff"
                    sub={`${totalStudents} students · ${totalInstructors} instructors`} />
                <StatCard icon={<BookMarked size={22} />} label="Total Courses" value={totalCourses} color="#10b981"
                    sub={`${publishedCourses} published`} />
                <StatCard icon={<GraduationCap size={22} />} label="Active Students" value={totalStudents} color="#06b6d4" />
                <StatCard icon={<FileText size={22} />} label="Announcements" value={announcements.length} color="#f59e0b" />
            </div>

            <div className="grid-2" style={{ marginBottom: 24 }}>
                {/* All Courses */}
                <div className="card">
                    <div style={{ fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <BookOpen size={16} style={{ color: 'var(--primary-light)' }} /> All Courses
                    </div>
                    {courses.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-muted)', fontSize: 14 }}>
                            No courses created yet. Instructors will create them.
                        </div>
                    ) : (
                        courses.slice(0, 6).map(c => (
                            <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border-light)' }}>
                                <div style={{ width: 36, height: 36, background: c.thumb.gradient, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
                                    {c.thumb.icon}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.title}</div>
                                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>by {c.createdByName} · {c.students} students</div>
                                </div>
                                <span className={`badge ${c.status === 'published' ? 'badge-success' : 'badge-neutral'}`}>{c.status}</span>
                            </div>
                        ))
                    )}
                </div>

                {/* All Registered Users */}
                <div className="card">
                    <div style={{ fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Users size={16} style={{ color: 'var(--primary-light)' }} /> Registered Users
                    </div>
                    {users.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-muted)', fontSize: 14 }}>
                            No users yet.
                        </div>
                    ) : (
                        users.slice(0, 6).map(u => {
                            const roleColorMap = {
                                Admin: '#f87171', Instructor: '#a78bfa',
                                Student: '#34d399', CONTENT_CREATOR: '#fbbf24',
                            };
                            const rColor = roleColorMap[u.role] || '#a78bfa';
                            return (
                                <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border-light)' }}>
                                    <div className="avatar-placeholder" style={{ width: 36, height: 36, background: `${rColor}25`, color: rColor, fontSize: 12 }}>
                                        {u.initials}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{u.name}</div>
                                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{u.email}</div>
                                    </div>
                                    <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 20, background: `${rColor}20`, color: rColor, fontWeight: 700 }}>{u.role}</span>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Role breakdown pills */}
            <div className="card">
                <div style={{ fontWeight: 600, marginBottom: 16 }}>Role Distribution</div>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    {[
                        { role: 'Admin', color: '#f87171' },
                        { role: 'Instructor', color: '#a78bfa' },
                        { role: 'Student', color: '#34d399' },
                        { role: 'CONTENT_CREATOR', color: '#fbbf24', label: 'Content Creator' },
                    ].map(({ role, color }) => {
                        const count = users.filter(u => u.role === role).length;
                        return (
                            <div key={role} style={{ padding: '12px 20px', borderRadius: 12, background: `${color}15`, border: `1px solid ${color}30`, textAlign: 'center', minWidth: 120 }}>
                                <div style={{ fontSize: 22, fontWeight: 700, color }}>{count}</div>
                                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{(role === 'CONTENT_CREATOR' ? 'Content Creator' : role)}{count !== 1 ? 's' : ''}</div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

// ── Instructor Dashboard ───────────────────────────────────────────────────────
function InstructorDashboard() {
    const {
        currentUser, users,
        getInstructorCourses, getInstructorAssignments, getInstructorSubmissions,
    } = useApp();

    const myCourses = getInstructorCourses(currentUser.id);
    const myAssignments = getInstructorAssignments(currentUser.id);
    const mySubmissions = getInstructorSubmissions(currentUser.id);
    const pendingGrading = mySubmissions.filter(s => s.status === 'pending').length;
    const students = users.filter(u => u.role === ROLES.STUDENT && u.status === 'active');

    return (
        <div className="animate-fadeIn">
            <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' }}>Welcome back, {currentUser.name.split(' ')[0]}! 👋</div>
                <div style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>Here's what's happening with your courses.</div>
            </div>

            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                <StatCard icon={<BookMarked size={22} />} label="My Courses" value={myCourses.length} color="#6c63ff"
                    sub={`${myCourses.filter(c => c.status === 'published').length} published`} />
                <StatCard icon={<GraduationCap size={22} />} label="Active Students" value={students.length} color="#10b981" />
                <StatCard icon={<FileText size={22} />} label="My Assignments" value={myAssignments.length} color="#06b6d4" />
                <StatCard icon={<Upload size={22} />} label="Pending Review" value={pendingGrading} color="#f59e0b"
                    sub={`${mySubmissions.filter(s => s.status === 'graded').length} graded`} />
            </div>

            <div className="grid-2" style={{ marginBottom: 24 }}>
                {/* My Courses summary */}
                <div className="card">
                    <div style={{ fontWeight: 600, marginBottom: 16 }}>My Courses</div>
                    {myCourses.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-muted)', fontSize: 14 }}>
                            No courses yet. Go to <strong>My Courses</strong> to create one.
                        </div>
                    ) : (
                        myCourses.slice(0, 5).map(c => (
                            <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border-light)' }}>
                                <div style={{ width: 36, height: 36, background: c.thumb.gradient, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
                                    {c.thumb.icon}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.title}</div>
                                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{c.students} students enrolled</div>
                                </div>
                                <span className={`badge ${c.status === 'published' ? 'badge-success' : 'badge-neutral'}`}>{c.status}</span>
                            </div>
                        ))
                    )}
                </div>

                {/* Recent submissions */}
                <div className="card">
                    <div style={{ fontWeight: 600, marginBottom: 16 }}>Recent Submissions</div>
                    {mySubmissions.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-muted)', fontSize: 14 }}>
                            No submissions yet.
                        </div>
                    ) : (
                        mySubmissions.slice(0, 5).map(s => (
                            <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border-light)' }}>
                                <div className="avatar-placeholder" style={{ width: 32, height: 32, background: 'var(--bg-elevated)', color: 'var(--text-secondary)', fontSize: 11, flexShrink: 0 }}>
                                    {s.studentInitials}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.studentName}</div>
                                    <div style={{ fontSize: 11, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.assignmentTitle}</div>
                                </div>
                                {s.status === 'graded'
                                    ? <span className="badge badge-success"><Star size={10} /> {s.score}</span>
                                    : <span className="badge badge-warning"><Clock size={10} /> Pending</span>}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

// ── Student Dashboard ──────────────────────────────────────────────────────────
function StudentDashboard() {
    const { currentUser, getEnrolledCourses, getStudentAssignments, submissions, contentItems } = useApp();

    const enrolled = getEnrolledCourses(currentUser.id);
    const myAssignments = getStudentAssignments(currentUser.id);
    const mySubmissions = submissions.filter(s => s.studentId === currentUser.id);
    const graded = mySubmissions.filter(s => s.status === 'graded');
    const avgScore = graded.length > 0
        ? Math.round(graded.reduce((acc, s) => acc + s.score, 0) / graded.length)
        : null;
    const pendingSubmit = myAssignments.filter(a => !mySubmissions.find(s => s.assignmentId === a.id)).length;
    const availableMaterials = contentItems.filter(ci => ci.status === 'published').length;

    return (
        <div className="animate-fadeIn">
            <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' }}>Welcome back, {currentUser.name.split(' ')[0]}! 📚</div>
                <div style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>Keep up the great learning momentum.</div>
            </div>

            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                <StatCard icon={<GraduationCap size={22} />} label="Enrolled Courses" value={enrolled.length} color="#6c63ff" />
                <StatCard icon={<FileText size={22} />} label="Assignments" value={myAssignments.length} color="#06b6d4"
                    sub={pendingSubmit > 0 ? `${pendingSubmit} to submit` : 'All submitted!'} />
                <StatCard icon={<Upload size={22} />} label="Submitted" value={mySubmissions.length} color="#10b981" />
                <StatCard icon={<Star size={22} />} label="Avg. Score" value={avgScore !== null ? `${avgScore}%` : '—'} color="#f59e0b"
                    sub={graded.length > 0 ? `${graded.length} graded` : 'Not graded yet'} />
            </div>

            {/* Enrolled courses */}
            <div className="card" style={{ marginBottom: 24 }}>
                <div style={{ fontWeight: 600, marginBottom: 16 }}>My Enrolled Courses</div>
                {enrolled.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                        <GraduationCap size={40} style={{ marginBottom: 12, opacity: 0.3 }} />
                        <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6, color: 'var(--text-secondary)' }}>Not enrolled in any course</div>
                        <div style={{ fontSize: 13 }}>Visit <strong>Browse Courses</strong> to enroll.</div>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
                        {enrolled.map(c => (
                            <div key={c.id} style={{ background: 'var(--bg-surface)', borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border-light)' }}>
                                <div style={{ height: 80, background: c.thumb.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 34 }}>
                                    {c.thumb.icon}
                                </div>
                                <div style={{ padding: '12px 14px' }}>
                                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>{c.title}</div>
                                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{c.category} · {c.level}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Study materials teaser */}
            {availableMaterials > 0 && (
                <div className="card" style={{ marginBottom: 24, background: 'linear-gradient(135deg, rgba(6,182,212,0.07), rgba(108,99,255,0.07))', border: '1px solid rgba(108,99,255,0.2)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(6,182,212,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#06b6d4' }}>
                            <Package size={24} />
                        </div>
                        <div>
                            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>{availableMaterials} Study Material{availableMaterials !== 1 ? 's' : ''} Available</div>
                            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Content creators have uploaded articles, lessons, and more for you.</div>
                        </div>
                        <div style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--primary-light)', fontWeight: 600 }}>Visit Study Materials →</div>
                    </div>
                </div>
            )}

            {/* Recent submissions */}
            <div className="card">
                <div style={{ fontWeight: 600, marginBottom: 16 }}>My Submissions</div>
                {mySubmissions.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '30px 20px', color: 'var(--text-muted)', fontSize: 14 }}>
                        No submissions yet. Go to <strong>Assignments</strong> to submit your work.
                    </div>
                ) : (
                    <div>
                        {mySubmissions.slice(0, 6).map(s => (
                            <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0', borderBottom: '1px solid var(--border-light)' }}>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.assignmentTitle}</div>
                                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.courseName} · Submitted {s.submittedAt}</div>
                                    {s.feedback && (
                                        <div style={{ fontSize: 11, color: '#34d399', marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            Feedback: {s.feedback}
                                        </div>
                                    )}
                                </div>
                                {s.status === 'graded'
                                    ? <span className="badge badge-success"><Star size={10} /> {s.score}/100</span>
                                    : <span className="badge badge-warning"><Clock size={10} /> Pending</span>}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

// ── Content Creator Dashboard ──────────────────────────────────────────────────
function ContentCreatorDashboard() {
    const { currentUser, contentItems, courses } = useApp();

    const myItems = contentItems.filter(ci => ci.createdBy === currentUser.id);
    const published = myItems.filter(ci => ci.status === 'published').length;
    const draft = myItems.filter(ci => ci.status === 'draft').length;
    const review = myItems.filter(ci => ci.status === 'review').length;
    const publishedCourses = courses.filter(c => c.status === 'published').length;

    return (
        <div className="animate-fadeIn">
            <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' }}>Welcome, {currentUser.name.split(' ')[0]}! ✍️</div>
                <div style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>Create and manage your educational materials.</div>
            </div>

            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                <StatCard icon={<PenLine size={22} />} label="Total Materials" value={myItems.length} color="#6c63ff" />
                <StatCard icon={<Package size={22} />} label="Published" value={published} color="#10b981"
                    sub="Visible to students" />
                <StatCard icon={<FileText size={22} />} label="In Draft" value={draft} color="#f59e0b"
                    sub="Not yet published" />
                <StatCard icon={<BookOpen size={22} />} label="Courses Available" value={publishedCourses} color="#06b6d4"
                    sub="To attach materials" />
            </div>

            <div className="grid-2" style={{ marginBottom: 24 }}>
                {/* Recent Materials */}
                <div className="card">
                    <div style={{ fontWeight: 600, marginBottom: 16 }}>My Recent Materials</div>
                    {myItems.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-muted)', fontSize: 14 }}>
                            No materials yet. Go to <strong>Content Library</strong> to create your first piece.
                        </div>
                    ) : (
                        myItems.slice(0, 6).map(ci => (
                            <div key={ci.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border-light)' }}>
                                <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
                                    📄
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ci.title}</div>
                                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{ci.type} · {ci.courseName || 'No course'}</div>
                                </div>
                                <span className={`badge ${ci.status === 'published' ? 'badge-success' : ci.status === 'review' ? 'badge-warning' : 'badge-neutral'}`}>{ci.status}</span>
                            </div>
                        ))
                    )}
                </div>

                {/* Available Courses */}
                <div className="card">
                    <div style={{ fontWeight: 600, marginBottom: 16 }}>Available Courses to Support</div>
                    {courses.filter(c => c.status === 'published').length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-muted)', fontSize: 14 }}>
                            No published courses yet.
                        </div>
                    ) : (
                        courses.filter(c => c.status === 'published').slice(0, 6).map(c => (
                            <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border-light)' }}>
                                <div style={{ width: 36, height: 36, background: c.thumb.gradient, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
                                    {c.thumb.icon}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.title}</div>
                                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{c.category} · by {c.createdByName}</div>
                                </div>
                                <span className="badge badge-success">Published</span>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Material type breakdown */}
            {myItems.length > 0 && (
                <div className="card">
                    <div style={{ fontWeight: 600, marginBottom: 16 }}>Content Breakdown by Status</div>
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                        {[
                            { label: 'Published', value: published, color: '#10b981' },
                            { label: 'In Review', value: review, color: '#f59e0b' },
                            { label: 'Draft', value: draft, color: '#6b7280' },
                        ].map(({ label, value, color }) => (
                            <div key={label} style={{ padding: '12px 24px', borderRadius: 12, background: `${color}15`, border: `1px solid ${color}30`, textAlign: 'center', minWidth: 100 }}>
                                <div style={{ fontSize: 24, fontWeight: 700, color }}>{value}</div>
                                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// ── Router ────────────────────────────────────────────────────────────────────
export default function Dashboard() {
    const { currentUser } = useApp();
    if (currentUser.role === ROLES.ADMIN) return <AdminDashboard />;
    if (currentUser.role === ROLES.INSTRUCTOR) return <InstructorDashboard />;
    if (currentUser.role === ROLES.CONTENT_CREATOR) return <ContentCreatorDashboard />;
    return <StudentDashboard />;
}
