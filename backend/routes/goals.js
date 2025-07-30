import express from 'express';
import dbManager from '../database/database.js';

const router = express.Router();

// Get user's goals
router.get('/', async (req, res) => {
  console.log(`🎯 Goals request for user: ${req.user.email}`);
  const userId = req.user.id;
  
  try {
    const goals = await dbManager.getUserGoals(userId);
    res.json({ goals });
  } catch (error) {
    console.error('❌ Database error:', error);
    res.status(500).json({ error: 'Failed to fetch goals' });
  }
});

// Add a goal for the user
router.post('/', async (req, res) => {
  console.log(`➕ Add goal request for user: ${req.user.email}`);
  const userId = req.user.id;
  const { goal } = req.body;
  
  if (!goal || typeof goal !== 'string' || !goal.trim()) {
    return res.status(400).json({ error: 'Goal is required and must be a non-empty string' });
  }
  
  const trimmedGoal = goal.trim();
  
  try {
    // Check if goal already exists
    const currentGoals = await dbManager.getUserGoals(userId);
    if (currentGoals.includes(trimmedGoal)) {
      return res.status(400).json({ error: 'Goal already exists' });
    }
    
    await dbManager.createGoal(userId, trimmedGoal);
    const updatedGoals = await dbManager.getUserGoals(userId);
    
    console.log(`✅ Goal added for ${req.user.email}: "${trimmedGoal}"`);
    res.json({ goals: updatedGoals });
  } catch (error) {
    console.error('❌ Database error:', error);
    res.status(500).json({ error: 'Failed to add goal' });
  }
});

// Remove a goal for the user
router.delete('/:index', async (req, res) => {
  console.log(`🗑️ Remove goal request for user: ${req.user.email}`);
  const userId = req.user.id;
  const goalIndex = parseInt(req.params.index);
  
  try {
    await dbManager.deleteGoal(userId, goalIndex);
    const updatedGoals = await dbManager.getUserGoals(userId);
    
    console.log(`✅ Goal removed for ${req.user.email} at index ${goalIndex}`);
    res.json({ goals: updatedGoals });
  } catch (error) {
    console.error('❌ Database error:', error);
    if (error.message === 'Invalid goal index') {
      res.status(400).json({ error: 'Invalid goal index' });
    } else {
      res.status(500).json({ error: 'Failed to remove goal' });
    }
  }
});

// Update all goals for the user (bulk update)
router.put('/', async (req, res) => {
  console.log(`📝 Update goals request for user: ${req.user.email}`);
  const userId = req.user.id;
  const { goals } = req.body;
  
  if (!Array.isArray(goals)) {
    return res.status(400).json({ error: 'Goals must be an array' });
  }
  
  // Validate each goal
  const validGoals = goals.filter(goal => 
    typeof goal === 'string' && goal.trim().length > 0
  ).map(goal => goal.trim());
  
  // Remove duplicates
  const uniqueGoals = [...new Set(validGoals)];
  
  try {
    await dbManager.updateUserGoals(userId, uniqueGoals);
    
    console.log(`✅ Goals updated for ${req.user.email}: ${uniqueGoals.length} goals`);
    res.json({ goals: uniqueGoals });
  } catch (error) {
    console.error('❌ Database error:', error);
    res.status(500).json({ error: 'Failed to update goals' });
  }
});

export default router;