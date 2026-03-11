import React, { useState, useEffect } from 'react';
import { 
  Video, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Play,
  DollarSign,
  Eye,
  X,
  List,
  Clock,
  ChevronRight,
  ChevronDown,
  GripVertical
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Lesson {
  id?: number;
  course_id: number;
  title: string;
  description: string;
  video_url: string;
  duration: string;
  order_index: number;
}

interface Course {
  id: number;
  title: string;
  description: string;
  video_url: string;
  price: number;
  is_premium: number;
  created_at: string;
  lessons?: Lesson[];
}

export const CourseManagement: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Partial<Course> | null>(null);
  const [activeModalTab, setActiveModalTab] = useState<'details' | 'lessons'>('details');
  const [newLesson, setNewLesson] = useState<Partial<Lesson>>({ title: '', video_url: '', duration: '' });
  const [isAddingLesson, setIsAddingLesson] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/admin/courses', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setCourses(data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingCourse?.id ? `/api/admin/courses/${editingCourse.id}` : '/api/admin/courses';
    const method = editingCourse?.id ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify(editingCourse)
      });
      if (response.ok) {
        fetchCourses();
        setIsModalOpen(false);
        setEditingCourse(null);
      }
    } catch (error) {
      console.error('Error saving course:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this course?')) return;
    try {
      const response = await fetch(`/api/admin/courses/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) fetchCourses();
    } catch (error) {
      console.error('Error deleting course:', error);
    }
  };

  const handleAddLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse?.id) return;
    
    try {
      const response = await fetch('/api/admin/lessons', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify({ ...newLesson, course_id: editingCourse.id })
      });
      if (response.ok) {
        // Refresh course data to show new lesson
        const updatedCourses = await fetch('/api/admin/courses', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }).then(res => res.json());
        setCourses(updatedCourses);
        const currentCourse = updatedCourses.find((c: any) => c.id === editingCourse.id);
        setEditingCourse(currentCourse);
        setNewLesson({ title: '', video_url: '', duration: '' });
        setIsAddingLesson(false);
      }
    } catch (error) {
      console.error('Error adding lesson:', error);
    }
  };

  const handleDeleteLesson = async (lessonId: number) => {
    if (!confirm('Delete this lesson?')) return;
    try {
      const response = await fetch(`/api/admin/lessons/${lessonId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const updatedCourses = await fetch('/api/admin/courses', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }).then(res => res.json());
        setCourses(updatedCourses);
        const currentCourse = updatedCourses.find((c: any) => c.id === editingCourse?.id);
        setEditingCourse(currentCourse);
      }
    } catch (error) {
      console.error('Error deleting lesson:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900">Course Catalog</h3>
        <button 
          onClick={() => {
            setEditingCourse({ title: '', description: '', video_url: '', price: 0, is_premium: 1 });
            setIsModalOpen(true);
          }}
          className="flex items-center px-4 py-3 bg-brand-accent text-white rounded-2xl font-bold hover:shadow-lg hover:shadow-brand-accent/20 transition-all"
        >
          <Plus size={20} className="mr-2" />
          Add New Course
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-12 text-slate-400 font-medium italic">Loading courses...</div>
        ) : courses.length === 0 ? (
          <div className="col-span-full text-center py-12 text-slate-400 font-medium italic">No courses available</div>
        ) : courses.map((course) => (
          <motion.div 
            key={course.id}
            layout
            className="bg-white rounded-3xl border border-brand-pink overflow-hidden shadow-sm hover:shadow-xl hover:shadow-brand-accent/5 transition-all group"
          >
            <div className="aspect-video bg-brand-pink/20 relative overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <Play size={48} className="text-brand-accent/30 group-hover:text-brand-accent transition-all group-hover:scale-110" />
              </div>
              <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                <button 
                  onClick={() => {
                    setEditingCourse(course);
                    setIsModalOpen(true);
                  }}
                  className="p-2 bg-white shadow-lg rounded-xl text-slate-600 hover:text-brand-accent transition-colors"
                >
                  <Edit2 size={16} />
                </button>
                <button 
                  onClick={() => handleDelete(course.id)}
                  className="p-2 bg-white shadow-lg rounded-xl text-slate-600 hover:text-rose-600 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              {course.is_premium === 1 && (
                <div className="absolute bottom-4 left-4 px-3 py-1 bg-brand-accent text-white text-[10px] font-bold uppercase tracking-widest rounded-full shadow-lg shadow-brand-accent/20">
                  Premium
                </div>
              )}
            </div>
            <div className="p-6">
              <h4 className="font-bold text-slate-900 truncate">{course.title}</h4>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2 h-8 font-medium">{course.description}</p>
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center text-brand-accent font-bold">
                  <DollarSign size={16} />
                  <span>{course.price.toFixed(2)}</span>
                </div>
                <div className="flex items-center text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                  <Eye size={14} className="mr-1" />
                  <span>1.2k views</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Course Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-brand-pink"
          >
            <div className="p-6 border-b border-brand-pink flex items-center justify-between bg-brand-pink/20">
              <h3 className="text-xl font-bold text-slate-900">{editingCourse?.id ? 'Edit Course' : 'Add New Course'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>

            {editingCourse?.id && (
              <div className="flex border-b border-brand-pink bg-brand-pink/10">
                <button 
                  onClick={() => setActiveModalTab('details')}
                  className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest transition-all ${activeModalTab === 'details' ? 'text-brand-accent border-b-2 border-brand-accent bg-white' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  Course Details
                </button>
                <button 
                  onClick={() => setActiveModalTab('lessons')}
                  className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest transition-all ${activeModalTab === 'lessons' ? 'text-brand-accent border-b-2 border-brand-accent bg-white' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  Lessons ({editingCourse.lessons?.length || 0})
                </button>
              </div>
            )}

            <div className="max-h-[70vh] overflow-y-auto">
              {activeModalTab === 'details' ? (
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Course Title</label>
                    <input
                      type="text"
                      required
                      value={editingCourse?.title || ''}
                      onChange={(e) => setEditingCourse({...editingCourse, title: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border border-brand-pink rounded-2xl focus:ring-2 focus:ring-brand-accent/20 outline-none font-medium"
                      placeholder="e.g. Advanced Vinyasa Flow"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Description</label>
                    <textarea
                      required
                      rows={3}
                      value={editingCourse?.description || ''}
                      onChange={(e) => setEditingCourse({...editingCourse, description: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border border-brand-pink rounded-2xl focus:ring-2 focus:ring-brand-accent/20 outline-none resize-none font-medium"
                      placeholder="Describe the course content..."
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Intro Video URL (YouTube Embed)</label>
                    <input
                      type="url"
                      required
                      value={editingCourse?.video_url || ''}
                      onChange={(e) => setEditingCourse({...editingCourse, video_url: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border border-brand-pink rounded-2xl focus:ring-2 focus:ring-brand-accent/20 outline-none font-medium"
                      placeholder="https://www.youtube.com/embed/..."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Price ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={editingCourse?.price || 0}
                        onChange={(e) => setEditingCourse({...editingCourse, price: parseFloat(e.target.value)})}
                        className="w-full px-4 py-3 bg-slate-50 border border-brand-pink rounded-2xl focus:ring-2 focus:ring-brand-accent/20 outline-none font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Access Type</label>
                      <select
                        value={editingCourse?.is_premium}
                        onChange={(e) => setEditingCourse({...editingCourse, is_premium: parseInt(e.target.value)})}
                        className="w-full px-4 py-3 bg-slate-50 border border-brand-pink rounded-2xl focus:ring-2 focus:ring-brand-accent/20 outline-none font-bold text-sm"
                      >
                        <option value={1}>Premium Only</option>
                        <option value={0}>Free Access</option>
                      </select>
                    </div>
                  </div>
                  <div className="pt-4 flex space-x-3">
                    <button 
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="flex-1 px-4 py-4 border border-brand-pink rounded-2xl font-bold text-slate-500 hover:bg-slate-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="flex-1 px-4 py-4 bg-brand-accent text-white rounded-2xl font-bold hover:shadow-lg hover:shadow-brand-accent/20 transition-all"
                    >
                      {editingCourse?.id ? 'Update Course' : 'Create Course'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900">Course Lessons</h4>
                    <button 
                      onClick={() => setIsAddingLesson(true)}
                      className="text-xs font-bold text-brand-accent hover:underline flex items-center gap-1 uppercase tracking-widest"
                    >
                      <Plus size={14} /> Add Lesson
                    </button>
                  </div>

                  <AnimatePresence>
                    {isAddingLesson && (
                      <motion.form 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        onSubmit={handleAddLesson}
                        className="p-4 bg-brand-pink/20 rounded-2xl border border-brand-pink space-y-3 overflow-hidden"
                      >
                        <input 
                          type="text" 
                          placeholder="Lesson Title" 
                          required
                          value={newLesson.title}
                          onChange={e => setNewLesson({...newLesson, title: e.target.value})}
                          className="w-full p-3 text-sm bg-white border border-brand-pink rounded-xl outline-none focus:ring-2 focus:ring-brand-accent/20 font-medium"
                        />
                        <input 
                          type="url" 
                          placeholder="Video URL (YouTube Embed)" 
                          required
                          value={newLesson.video_url}
                          onChange={e => setNewLesson({...newLesson, video_url: e.target.value})}
                          className="w-full p-3 text-sm bg-white border border-brand-pink rounded-xl outline-none focus:ring-2 focus:ring-brand-accent/20 font-medium"
                        />
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            placeholder="Duration (e.g. 10:00)" 
                            value={newLesson.duration}
                            onChange={e => setNewLesson({...newLesson, duration: e.target.value})}
                            className="flex-1 p-3 text-sm bg-white border border-brand-pink rounded-xl outline-none focus:ring-2 focus:ring-brand-accent/20 font-medium"
                          />
                          <button type="submit" className="px-4 py-2 bg-brand-accent text-white text-xs font-bold rounded-xl shadow-lg shadow-brand-accent/10">Add</button>
                          <button type="button" onClick={() => setIsAddingLesson(false)} className="px-4 py-2 bg-slate-200 text-slate-600 text-xs font-bold rounded-xl">Cancel</button>
                        </div>
                      </motion.form>
                    )}
                  </AnimatePresence>

                  <div className="space-y-3">
                    {editingCourse.lessons?.length === 0 ? (
                      <div className="text-center py-8 text-slate-400 text-sm italic font-medium">No lessons added yet.</div>
                    ) : (
                      editingCourse.lessons?.map((lesson, idx) => (
                        <div key={lesson.id} className="flex items-center gap-3 p-3 bg-white border border-brand-pink/50 rounded-2xl group hover:shadow-md transition-all">
                          <div className="w-8 h-8 rounded-xl bg-brand-pink flex items-center justify-center text-brand-accent font-bold text-xs shadow-sm">
                            {idx + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="text-sm font-bold text-slate-900 truncate">{lesson.title}</h5>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{lesson.duration || 'N/A'}</p>
                          </div>
                          <button 
                            onClick={() => handleDeleteLesson(lesson.id!)}
                            className="p-2 text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
