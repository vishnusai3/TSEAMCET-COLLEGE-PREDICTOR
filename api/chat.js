const { createOrAppendStudentQuestion, getStudentConversation, getStudentConversations, getAdminQueryList, getAdminMessagesForQuery, adminReplyToQuery } = require('../controllers/chatController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const setCorsHeaders = (res) => {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
};

export default async function handler(req, res) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const action = req.query.action;

    // Student routes (protected)
    if (action === 'create-question' || action === 'get-conversation' || action === 'get-conversations') {
      await protect(req, res, () => {});
      if (res.headersSent) return;

      if (req.method === 'POST' && action === 'create-question') {
        return await createOrAppendStudentQuestion(req, res);
      } else if (req.method === 'GET' && action === 'get-conversation') {
        return await getStudentConversation(req, res);
      } else if (req.method === 'GET' && action === 'get-conversations') {
        return await getStudentConversations(req, res);
      }
    }

    // Admin routes (protected + admin only)
    if (action === 'admin-queries' || action === 'admin-messages' || action === 'admin-reply') {
      await protect(req, res, () => {});
      if (res.headersSent) return;

      await adminOnly(req, res, () => {});
      if (res.headersSent) return;

      if (req.method === 'GET' && action === 'admin-queries') {
        return await getAdminQueryList(req, res);
      } else if (req.method === 'GET' && action === 'admin-messages') {
        return await getAdminMessagesForQuery(req, res);
      } else if (req.method === 'POST' && action === 'admin-reply') {
        return await adminReplyToQuery(req, res);
      }
    }

    res.status(404).json({ message: 'Route not found' });
  } catch (error) {
    console.error('Chat handler error:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
}