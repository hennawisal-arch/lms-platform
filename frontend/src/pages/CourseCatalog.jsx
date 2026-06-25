import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import CourseCard from '../components/CourseCard';

export default function CourseCatalog() {
  const [courses, setCourses] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchCourses = async (overrides = {}) => {
    setLoading(true);
    try {
      const params = { search, category, ...overrides };
      const { data } = await api.get('/courses', { params });
      setCourses(data.courses);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();

    // Fetch the full, unfiltered category list once so the dropdown's
    // options stay stable no matter which filter is currently applied.
    api.get('/courses').then(({ data }) => {
      setCategoryOptions([...new Set(data.courses.map((c) => c.category).filter(Boolean))]);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchCourses();
  };

  const handleCategoryChange = (e) => {
    const value = e.target.value;
    setCategory(value);
    fetchCourses({ category: value }); // filter immediately, don't wait for the Search button
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-display font-bold text-white mb-1">Browse Courses</h1>
      <p className="text-sm text-slate-400 mb-6">Find your next skill.</p>

      <form onSubmit={handleSearch} className="flex flex-wrap gap-3 mb-8">
        <input
          className="input max-w-sm"
          placeholder="Search courses..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="input max-w-[180px]" value={category} onChange={handleCategoryChange}>
          <option value="">All categories</option>
          {categoryOptions.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <button type="submit" className="btn-primary">Search</button>
      </form>

      {loading ? (
        <p className="text-slate-400">Loading courses...</p>
      ) : courses.length === 0 ? (
        <p className="text-slate-400">No courses found.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {courses.map((course) => (
            <CourseCard key={course._id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
}
