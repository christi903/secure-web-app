const { createClient } = require('@supabase/supabase-js');

// Use environment variables
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Service role is required for admin tasks
);

module.exports = supabase;
