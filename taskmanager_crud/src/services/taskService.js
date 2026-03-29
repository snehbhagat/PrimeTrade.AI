const { supabaseAdmin } = require('../config/supabase');
const redis = require('../config/redis');

const CACHE_TTL = 60; // 60 seconds

// Get all tasks for a user
const getUserTasks = async (userId) => {
  const cacheKey = `tasks:${userId}`;

  // 1. Check Redis cache first
  const cached = await redis.get(cacheKey);
  if (cached) {
    console.log('✅ Cache hit');
    return JSON.parse(cached);
  }

  // 2. If no cache, fetch from DB
  console.log('ℹ️ Cache miss');
  const { data, error } = await supabaseAdmin
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);

  // 3. Store in Redis cache
  await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(data));

  return data;
};

// Get single task
const getTaskById = async (taskId, userId) => {
  const { data, error } = await supabaseAdmin
    .from('tasks')
    .select('*')
    .eq('id', taskId)
    .eq('user_id', userId)
    .single();

  if (error) throw new Error(error.message);
  return data;
};

// Create task
const createTask = async (userId, taskData) => {
  const { data, error } = await supabaseAdmin
    .from('tasks')
    .insert({ ...taskData, user_id: userId })
    .select()
    .single();

  if (error) throw new Error(error.message);

  // Invalidate cache
  await redis.del(`tasks:${userId}`);

  return data;
};

// Update task
const updateTask = async (taskId, userId, taskData) => {
  const { data, error } = await supabaseAdmin
    .from('tasks')
    .update(taskData)
    .eq('id', taskId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw new Error(error.message);

  // Invalidate cache
  await redis.del(`tasks:${userId}`);

  return data;
};

// Delete task
const deleteTask = async (taskId, userId) => {
  const { error } = await supabaseAdmin
    .from('tasks')
    .delete()
    .eq('id', taskId)
    .eq('user_id', userId);

  if (error) throw new Error(error.message);

  // Invalidate cache
  await redis.del(`tasks:${userId}`);
};

module.exports = { getUserTasks, getTaskById, createTask, updateTask, deleteTask };