import React, { useEffect, useState } from 'react';
import api from '../api/axios';

export default function Certificates() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/certificates/my').then(({ data }) => setCertificates(data.certificates)).finally(() => setLoading(false));
  }, []);

  const handleDownload = async (cert) => {
    const res = await api.get(`/certificates/${cert._id}/download`, { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `${cert.courseName.replace(/\s+/g, '_')}_Certificate.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };

  if (loading) return <div className="px-6 py-16 text-center text-slate-400">Loading certificates...</div>;

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-display font-bold text-white mb-1">My Certificates</h1>
      <p className="text-sm text-slate-400 mb-8">Auto-generated the moment you complete a course.</p>

      {certificates.length === 0 ? (
        <div className="card p-10 text-center text-slate-400">
          No certificates yet — complete a course and pass its final exam to earn one.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-5">
          {certificates.map((cert) => (
            <div key={cert._id} className="card p-5 flex flex-col">
              <span className="badge w-fit mb-3">Certificate of Completion</span>
              <h3 className="font-display font-semibold text-white mb-1">{cert.courseName}</h3>
              <p className="text-sm text-slate-400 mb-1">Issued to {cert.studentName}</p>
              <p className="text-xs text-slate-500 mb-4">
                {new Date(cert.issuedAt).toLocaleDateString()} &middot; ID: {cert.certificateCode}
              </p>
              <button onClick={() => handleDownload(cert)} className="btn-primary mt-auto">Download PDF</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
