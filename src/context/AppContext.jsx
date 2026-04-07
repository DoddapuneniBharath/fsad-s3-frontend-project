import { createContext, useContext, useState, useEffect } from 'react';
import { authApi, coursesApi, usersApi, assignmentsApi, announcementsApi } from '../api';

const AppContext = createContext();

export const ROLES = {
  ADMIN: 'Admin',
  INSTRUCTOR: 'Instructor',
  STUDENT: 'Student',
  CONTENT_CREATOR: 'CONTENT_CREATOR',  // must match Java enum exactly
};

const ROLE_COLORS = {
  Admin: { bg: 'rgba(239,68,68,0.15)', color: '#f87171', border: 'rgba(239,68,68,0.3)' },
  Instructor: { bg: 'rgba(108,99,255,0.15)', color: '#a78bfa', border: 'rgba(108,99,255,0.3)' },
  Student: { bg: 'rgba(16,185,129,0.15)', color: '#34d399', border: 'rgba(16,185,129,0.3)' },
  'Content Creator': { bg: 'rgba(245,158,11,0.15)', color: '#fbbf24', border: 'rgba(245,158,11,0.3)' },
};

export const COURSE_THUMBS = [
  { gradient: 'linear-gradient(135deg, #667eea, #764ba2)', icon: '💻' },
  { gradient: 'linear-gradient(135deg, #f093fb, #f5576c)', icon: '🎨' },
  { gradient: 'linear-gradient(135deg, #4facfe, #00f2fe)', icon: '📊' },
  { gradient: 'linear-gradient(135deg, #43e97b, #38f9d7)', icon: '🔬' },
  { gradient: 'linear-gradient(135deg, #fa709a, #fee140)', icon: '📐' },
  { gradient: 'linear-gradient(135deg, #a18cd1, #fbc2eb)', icon: '🤖' },
  { gradient: 'linear-gradient(135deg, #ffecd2, #fcb69f)', icon: '📸' },
  { gradient: 'linear-gradient(135deg, #a1c4fd, #c2e9fb)', icon: '📱' },
];

// Custom hook to persist state to local storage
function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error('Error reading localStorage', error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error setting localStorage', error);
    }
  }, [key, value]);

  return [value, setValue];
}

export function AppProvider({ children }) {
  const [currentUser, setCurrentUser] = useLocalStorage('lms_currentUser', null);
  const [apiToken, setApiToken]       = useLocalStorage('coursecloud_token', null);
  const [users, setUsers] = useLocalStorage('lms_users', []);
  const [courses, setCourses] = useLocalStorage('lms_courses', []);
  const [assignments, setAssignments] = useLocalStorage('lms_assignments', []);
  const [submissions, setSubmissions] = useLocalStorage('lms_submissions', []);
  const [announcements, setAnnouncements] = useLocalStorage('lms_announcements', []);
  const [enrollments, setEnrollments] = useLocalStorage('lms_enrollments', {});
  const [notifications, setNotifications] = useLocalStorage('lms_notifications', []);
  // contentItems: materials created by Content Creators
  const [contentItems, setContentItems] = useLocalStorage('lms_contentItems', []);

  // ── BACKEND AUTH ──────────────────────────────────────────────────────────

  const login = async (email, password) => {
    try {
      const data = await authApi.login({ email, password });
      setApiToken(data.token);
      setCurrentUser(data.user);
      return { user: data.user };
    } catch (err) {
      return { error: err.message };
    }
  };

  const register = async ({ name, email, password, role }) => {
    try {
      const data = await authApi.register({ name, email, password, role });
      setApiToken(data.token);
      setCurrentUser(data.user);
      return { user: data.user, message: data.message };
    } catch (err) {
      return { error: err.message };
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setApiToken(null);
    localStorage.removeItem('coursecloud_token');
  };

  // ── COURSES ── (all saved to backend MySQL database) ──────────────────────

  const mapUserFromApi = (u) => ({
    ...u,
    role: u?.role,
    status: (u?.status || '').toLowerCase(),
    joined: u?.joinedAt ? String(u.joinedAt).split('T')[0] : '',
  });

  const mapAssignmentFromApi = (a) => ({
    ...a,
    dueDate: a?.dueDate ? String(a.dueDate).split('T')[0] : '',
    createdAt: a?.createdAt ? String(a.createdAt).split('T')[0] : '',
    submissions: a?.submissionsCount ?? 0,
    graded: a?.gradedCount ?? 0,
    createdBy: a?.instructorId,
    createdByName: a?.instructorName,
  });

  const mapSubmissionFromApi = (s) => ({
    ...s,
    submittedAt: s?.submittedAt ? String(s.submittedAt).split('T')[0] : '',
  });

  const mapAnnouncementFromApi = (a) => ({
    id: a.id,
    title: a.title,
    message: a.content,
    type: 'general',
    author: a?.author?.name || 'System',
    role: a?.author?.role || 'System',
    date: a?.createdAt ? String(a.createdAt).split('T')[0] : '',
  });

  // Load courses from backend whenever user logs in
  useEffect(() => {
    if (!currentUser) return;
    coursesApi.getAll()
      .then(data => {
        // Attach thumbnail based on course index
        const withThumbs = (Array.isArray(data) ? data : []).map((c, i) => ({
          ...c,
          thumb: c.thumb || COURSE_THUMBS[i % COURSE_THUMBS.length],
        }));
        setCourses(withThumbs);
      })
      .catch(err => console.warn('Could not load courses from backend:', err.message));
  }, [currentUser]);

  // Load users for admin dashboard/user management
  useEffect(() => {
    if (!currentUser || currentUser.role !== ROLES.ADMIN) return;
    usersApi.getAll()
      .then(data => setUsers((Array.isArray(data) ? data : []).map(mapUserFromApi)))
      .catch(err => console.warn('Could not load users from backend:', err.message));
  }, [currentUser]);

  // Load assignments + submissions for current role
  useEffect(() => {
    if (!currentUser) return;
    assignmentsApi.getAll()
      .then(data => setAssignments((Array.isArray(data) ? data : []).map(mapAssignmentFromApi)))
      .catch(err => console.warn('Could not load assignments from backend:', err.message));

    assignmentsApi.getSubmissions()
      .then(data => setSubmissions((Array.isArray(data) ? data : []).map(mapSubmissionFromApi)))
      .catch(err => console.warn('Could not load submissions from backend:', err.message));
  }, [currentUser]);

  // Load announcements for all authenticated users
  useEffect(() => {
    if (!currentUser) return;
    announcementsApi.getAll()
      .then(data => setAnnouncements((Array.isArray(data) ? data : []).map(mapAnnouncementFromApi)))
      .catch(err => console.warn('Could not load announcements from backend:', err.message));
  }, [currentUser]);

  /** Create course → saved to MySQL via backend API */
  const addCourse = async (courseData) => {
    try {
      const created = await coursesApi.create(courseData);
      const withThumb = { ...created, thumb: COURSE_THUMBS[courses.length % COURSE_THUMBS.length] };
      setCourses(prev => [withThumb, ...prev]);
      return withThumb;
    } catch (err) {
      console.error('addCourse error:', err.message);
      window.alert('Failed to create course: ' + err.message);
      return null;
    }
  };

  /** Update course → saved to MySQL via backend API */
  const updateCourse = async (id, updates) => {
    try {
      const updated = await coursesApi.update(id, updates);
      setCourses(prev => prev.map(c => c.id === id ? { ...c, ...updated, thumb: c.thumb } : c));
    } catch (err) {
      console.error('updateCourse error:', err.message);
    }
  };

  /** Delete course → removed from MySQL via backend API */
  const deleteCourse = async (id) => {
    try {
      await coursesApi.delete(id);
      setCourses(prev => prev.filter(c => c.id !== id));
      setAssignments(prev => prev.filter(a => a.courseId !== id));
    } catch (err) {
      console.error('deleteCourse error:', err.message);
    }
  };

  // ── SCOPED VIEWS ──────────────────────────────────────────────────────────

  /** Courses an Instructor created */
  const getInstructorCourses = (instructorId) =>
    courses.filter(c => String(c.createdBy) === String(instructorId));

  /** All published courses */
  const getPublishedCourses = () => courses.filter(c => c.status === 'published');

  /** Courses a student is enrolled in */
  const getEnrolledCourses = (studentId) =>
    courses.filter(c => (enrollments[c.id] || []).includes(studentId));

  /** Assignments an Instructor can manage */
  const getInstructorAssignments = (instructorId) => {
    const myCourseIds = new Set(getInstructorCourses(instructorId).map(c => c.id));
    return assignments.filter(a => myCourseIds.has(a.courseId));
  };

  /** Assignments visible to a student */
  const getStudentAssignments = (studentId) => {
    const enrolledIds = new Set(getEnrolledCourses(studentId).map(c => c.id));
    return assignments.filter(a => enrolledIds.has(a.courseId));
  };

  /** Submissions visible to an instructor */
  const getInstructorSubmissions = (instructorId) => {
    const myAssignmentIds = new Set(getInstructorAssignments(instructorId).map(a => a.id));
    return submissions.filter(s => myAssignmentIds.has(s.assignmentId));
  };

  // ── ENROLLMENTS → backend API ──────────────────────────────────────────────

  const enrollStudent = async (userId, courseId) => {
    try {
      await coursesApi.enroll(courseId);
      setEnrollments(prev => ({
        ...prev,
        [courseId]: [...(prev[courseId] || []), userId],
      }));
      setCourses(prev => prev.map(c =>
        c.id === courseId ? { ...c, students: (c.students || 0) + 1 } : c
      ));
    } catch (err) {
      console.error('enroll error:', err.message);
    }
  };

  const isEnrolled = (userId, courseId) =>
    !!(enrollments[courseId] || []).includes(userId);

  // ── ASSIGNMENTS ───────────────────────────────────────────────────────────
  // Only Instructors can add/delete assignments

  const addAssignment = async ({ title, courseId, dueDate, maxScore, description }) => {
    try {
      const created = await assignmentsApi.create({
        title,
        courseId: Number(courseId),
        dueDate,
        maxScore: Number(maxScore) || 100,
        description: description || '',
        status: 'active',
      });
      const mapped = mapAssignmentFromApi(created);
      setAssignments(prev => [mapped, ...prev]);
      return mapped;
    } catch (err) {
      console.error('addAssignment error:', err.message);
      window.alert('Failed to create assignment: ' + err.message);
      return null;
    }
  };

  const deleteAssignment = async (id) => {
    try {
      await assignmentsApi.delete(id);
      setAssignments(prev => prev.filter(a => a.id !== id));
      setSubmissions(prev => prev.filter(s => s.assignmentId !== id));
    } catch (err) {
      console.error('deleteAssignment error:', err.message);
    }
  };

  // ── SUBMISSIONS ───────────────────────────────────────────────────────────

  const submitAssignment = async (assignmentId, studentId, studentName, studentInitials, answer) => {
    if (submissions.find(s => String(s.assignmentId) === String(assignmentId) && String(s.studentId) === String(studentId))) {
      return { error: 'You have already submitted this assignment.' };
    }
    try {
      const created = await assignmentsApi.submit(assignmentId, answer || '');
      const mapped = mapSubmissionFromApi(created);
      setSubmissions(prev => [mapped, ...prev]);
      setAssignments(prev =>
        prev.map(a => String(a.id) === String(assignmentId) ? { ...a, submissions: (a.submissions || 0) + 1 } : a)
      );
      return { submission: mapped };
    } catch (err) {
      return { error: err.message };
    }
  };

  const gradeSubmission = async (id, score, feedback) => {
    try {
      const updated = await assignmentsApi.grade(id, Number(score), feedback || '');
      const mapped = mapSubmissionFromApi(updated);
      const prevSub = submissions.find(s => String(s.id) === String(id));
      setSubmissions(prev => prev.map(s => String(s.id) === String(id) ? { ...s, ...mapped } : s));
      if (prevSub && prevSub.status !== 'graded') {
        setAssignments(prev =>
          prev.map(a => String(a.id) === String(prevSub.assignmentId) ? { ...a, graded: (a.graded || 0) + 1 } : a)
        );
      }
    } catch (err) {
      console.error('gradeSubmission error:', err.message);
    }
  };

  // ── USERS (admin: manage all) ──────────────────────────────────────────────

  const addUser = (user) => setUsers(prev => [{
    ...user,
    id: Date.now(),
    initials: user.name.split(' ').map(n => n[0]).join('').toUpperCase(),
    status: 'active',
    courses: 0,
  }, ...prev]);
  const updateUser = async (id, updates) => {
    try {
      const updated = await usersApi.update(id, updates);
      const mapped = mapUserFromApi(updated);
      setUsers(prev => prev.map(u => String(u.id) === String(id) ? { ...u, ...mapped } : u));
    } catch (err) {
      console.error('updateUser error:', err.message);
    }
  };
  const deleteUser = async (id) => {
    try {
      await usersApi.delete(id);
      setUsers(prev => prev.filter(u => String(u.id) !== String(id)));
    } catch (err) {
      console.error('deleteUser error:', err.message);
    }
  };

  // ── CONTENT ITEMS (Content Creator) ───────────────────────────────────────

  const addContent = (item) => {
    const newItem = {
      ...item,
      id: Date.now(),
      createdBy: currentUser.id,
      createdByName: currentUser.name,
      views: 0,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setContentItems(prev => [newItem, ...prev]);
    return newItem;
  };

  const updateContent = (id, updates) =>
    setContentItems(prev => prev.map(ci => ci.id === id ? { ...ci, ...updates } : ci));

  const deleteContent = (id) =>
    setContentItems(prev => prev.filter(ci => ci.id !== id));

  // ── ANNOUNCEMENTS ─────────────────────────────────────────────────────────

  const addAnnouncement = async (ann) => {
    try {
      const priorityByType = { maintenance: 'high', assignment: 'medium', course: 'medium', general: 'low' };
      const created = await announcementsApi.create({
        title: ann.title,
        content: ann.message,
        priority: priorityByType[ann.type] || 'low',
      });
      const mapped = mapAnnouncementFromApi(created);
      setAnnouncements(prev => [mapped, ...prev]);
      return mapped;
    } catch (err) {
      console.error('addAnnouncement error:', err.message);
      window.alert('Failed to post announcement: ' + err.message);
      return null;
    }
  };

  return (
    <AppContext.Provider value={{
      // auth
      currentUser, login, register, logout,
      // users
      users, addUser, updateUser, deleteUser,
      // courses
      courses, addCourse, updateCourse, deleteCourse,
      getInstructorCourses, getPublishedCourses, getEnrolledCourses,
      // enrollments
      enrollments, enrollStudent, isEnrolled,
      // assignments
      assignments, addAssignment, deleteAssignment,
      getInstructorAssignments, getStudentAssignments,
      // submissions
      submissions, submitAssignment, gradeSubmission,
      getInstructorSubmissions,
      // content items
      contentItems, addContent, updateContent, deleteContent,
      // announcements
      announcements, addAnnouncement,
      // notifications
      notifications, setNotifications,
      // constants
      ROLE_COLORS, COURSE_THUMBS,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
export { ROLE_COLORS };
