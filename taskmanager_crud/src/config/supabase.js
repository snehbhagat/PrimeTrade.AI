const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Regular client — for user-level operations
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Admin client — for privileged operations (e.g. reading any user's tasks as admin)
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

module.exports = { supabase, supabaseAdmin };