const { supabaseAdmin } = require('../config/supabase');
const { sendError } = require('../utils/response');

const authenticate = async (req, res, next) => {
  try {
    // 1. Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 401, 'No token provided');
    }

    const token = authHeader.split(' ')[1];

    // 2. Verify token with Supabase
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) return sendError(res, 401, 'Invalid or expired token');

    // 3. Fetch user details from our users table
    const { data: userData, error: dbError } = await supabaseAdmin
      .from('users')
      .select('id, name, email, role')
      .eq('id', user.id)
      .single();

    if (dbError || !userData) return sendError(res, 401, 'User not found');

    // 4. Attach user to request object
    req.user = userData;

    next();

  } catch (err) {
    return sendError(res, 500, 'Internal server error');
  }
};

module.exports = { authenticate };