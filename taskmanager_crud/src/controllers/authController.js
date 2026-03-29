const { supabase } = require('../config/supabase');
const { sendSuccess, sendError } = require('../utils/response');

// Register
const register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // 1. Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name }
      }
    });

    if (authError) return sendError(res, 400, authError.message);

    // 2. Insert user into our custom users table
    const { error: dbError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id, // use same ID as Supabase Auth
        name,
        email,
        password: 'managed_by_supabase', // password is handled by Supabase Auth
        role: 'user'
      });

    if (dbError) return sendError(res, 400, dbError.message);

    return sendSuccess(res, 201, 'User registered successfully', {
      user: {
        id: authData.user.id,
        name,
        email,
        role: 'user'
      }
    });

  } catch (err) {
    return sendError(res, 500, 'Internal server error');
  }
};

// Login
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Sign in with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) return sendError(res, 401, authError.message);

    // 2. Fetch user details from our users table
    const { data: userData, error: dbError } = await supabase
      .from('users')
      .select('id, name, email, role')
      .eq('id', authData.user.id)
      .single();

    if (dbError) return sendError(res, 400, dbError.message);

    return sendSuccess(res, 200, 'Login successful', {
      token: authData.session.access_token,
      user: userData
    });

  } catch (err) {
    return sendError(res, 500, 'Internal server error');
  }
};

module.exports = { register, login };