const { getAllStudents, uploadCutoffs, getAnalytics, deleteStudent, addSingleCollege } = require('../controllers/adminController');
const multer = require('multer');
const path = require('path');

const setCorsHeaders = (res) => {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
};

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (path.extname(file.originalname) === '.csv') {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  }
});

export default async function handler(req, res) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // For testing: allow all access (no auth required)
    // In production: uncomment auth lines below
    
    // await protect(req, res, () => {});
    // if (res.headersSent) return;
    // await adminOnly(req, res, () => {});
    // if (res.headersSent) return;

    const action = req.query.action;

    if (req.method === 'GET' && action === 'students') {
      return await getAllStudents(req, res);
    } else if (req.method === 'GET' && action === 'analytics') {
      return await getAnalytics(req, res);
    } else if (req.method === 'POST' && action === 'upload-cutoffs') {
      return upload.single('file')(req, res, async (err) => {
        if (err) return res.status(400).json({ message: err.message });
        await uploadCutoffs(req, res);
      });
    } else if (req.method === 'DELETE' && action === 'delete-student') {
      return await deleteStudent(req, res);
    } else if (req.method === 'POST' && action === 'add-college') {
      return await addSingleCollege(req, res);
    }

    res.status(404).json({ message: 'Route not found' });
  } catch (error) {
    console.error('Admin handler error:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
}