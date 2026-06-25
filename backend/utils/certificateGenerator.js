const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const certDir = path.join(__dirname, '..', 'certificates');
fs.mkdirSync(certDir, { recursive: true });

/**
 * Renders a certificate of completion PDF to disk.
 * Returns the filename (relative to the certificates directory).
 */
function generateCertificatePdf({ certificateCode, studentName, courseName, instructorName, issuedAt }) {
  const fileName = `${certificateCode}.pdf`;
  const filePath = path.join(certDir, fileName);

  const doc = new PDFDocument({ layout: 'landscape', size: 'A4', margin: 0 });
  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);

  const { width, height } = doc.page;

  // Background
  doc.rect(0, 0, width, height).fill('#0c0f1a');

  // Decorative border
  doc.lineWidth(3).strokeColor('#6366f1').rect(30, 30, width - 60, height - 60).stroke();
  doc.lineWidth(1).strokeColor('#a5b4fc').rect(45, 45, width - 90, height - 90).stroke();

  doc.fillColor('#a5b4fc').fontSize(14).font('Helvetica-Bold')
    .text('LMS EDUCATION PLATFORM', 0, 90, { align: 'center' });

  doc.fillColor('#f8fafc').fontSize(34).font('Helvetica-Bold')
    .text('Certificate of Completion', 0, 130, { align: 'center' });

  doc.fillColor('#cbd5e1').fontSize(13).font('Helvetica')
    .text('This certificate is proudly presented to', 0, 195, { align: 'center' });

  doc.fillColor('#ffffff').fontSize(30).font('Helvetica-Bold')
    .text(studentName, 0, 225, { align: 'center' });

  doc.fillColor('#cbd5e1').fontSize(13).font('Helvetica')
    .text('for successfully completing the course', 0, 275, { align: 'center' });

  doc.fillColor('#a5b4fc').fontSize(20).font('Helvetica-Bold')
    .text(courseName, 60, 305, { align: 'center', width: width - 120 });

  const dateStr = new Date(issuedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  doc.fillColor('#94a3b8').fontSize(11).font('Helvetica')
    .text(`Issued on ${dateStr}`, 0, height - 140, { align: 'center' });

  // Signature line / instructor
  doc.fillColor('#f8fafc').fontSize(13).font('Helvetica-Bold')
    .text(instructorName, 100, height - 105, { width: 220, align: 'center' });
  doc.moveTo(100, height - 110).lineTo(320, height - 110).strokeColor('#475569').stroke();
  doc.fillColor('#94a3b8').fontSize(10).font('Helvetica')
    .text('Course Instructor', 100, height - 90, { width: 220, align: 'center' });

  // Certificate code / verification
  doc.fillColor('#f8fafc').fontSize(13).font('Helvetica-Bold')
    .text(certificateCode, width - 320, height - 105, { width: 220, align: 'center' });
  doc.moveTo(width - 320, height - 110).lineTo(width - 100, height - 110).strokeColor('#475569').stroke();
  doc.fillColor('#94a3b8').fontSize(10).font('Helvetica')
    .text('Certificate ID', width - 320, height - 90, { width: 220, align: 'center' });

  doc.end();

  return new Promise((resolve, reject) => {
    stream.on('finish', () => resolve(fileName));
    stream.on('error', reject);
  });
}

module.exports = { generateCertificatePdf, certDir };
