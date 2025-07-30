import express from 'express';
import dbManager from '../database/database.js';

const router = express.Router();

// Get user's flashcards
router.get('/', async (req, res) => {
  console.log(`🃏 Flashcards request for user: ${req.user.email}`);
  const userId = req.user.id;
  
  try {
    const flashcards = await dbManager.getUserFlashcards(userId);
    res.json(flashcards);
  } catch (error) {
    console.error('❌ Database error:', error);
    res.status(500).json({ error: 'Failed to fetch flashcards' });
  }
});

// Create a new flashcard
router.post('/', async (req, res) => {
  console.log(`➕ Add flashcard request for user: ${req.user.email}`);
  const userId = req.user.id;
  const { front, back } = req.body;
  
  if (!front && !back) {
    return res.status(400).json({ error: 'Front or back is required' });
  }
  
  try {
    const newFlashcard = await dbManager.createFlashcard(
      userId,
      front?.trim() || 'Untitled Front',
      back?.trim() || ''
    );
    
    console.log(`✅ Flashcard created for ${req.user.email}: "${newFlashcard.front}"`);
    res.status(201).json(newFlashcard);
  } catch (error) {
    console.error('❌ Database error:', error);
    res.status(500).json({ error: 'Failed to create flashcard' });
  }
});

// Update a flashcard
router.put('/:id', async (req, res) => {
  console.log(`📝 Update flashcard request for user: ${req.user.email}`);
  const userId = req.user.id;
  const flashcardId = parseInt(req.params.id);
  const { front, back } = req.body;
  
  try {
    const updatedFlashcard = await dbManager.updateFlashcard(
      flashcardId,
      userId,
      front?.trim() || 'Untitled Front',
      back?.trim() || ''
    );
    
    if (!updatedFlashcard) {
      return res.status(404).json({ error: 'Flashcard not found' });
    }
    
    console.log(`✅ Flashcard updated for ${req.user.email}: "${updatedFlashcard.front}"`);
    res.json(updatedFlashcard);
  } catch (error) {
    console.error('❌ Database error:', error);
    res.status(500).json({ error: 'Failed to update flashcard' });
  }
});

// Delete a flashcard
router.delete('/:id', async (req, res) => {
  console.log(`🗑️ Delete flashcard request for user: ${req.user.email}`);
  const userId = req.user.id;
  const flashcardId = parseInt(req.params.id);
  
  try {
    const result = await dbManager.deleteFlashcard(flashcardId, userId);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Flashcard not found' });
    }
    
    console.log(`✅ Flashcard deleted for ${req.user.email}, ID: ${flashcardId}`);
    res.json({ success: true, message: 'Flashcard deleted successfully' });
  } catch (error) {
    console.error('❌ Database error:', error);
    res.status(500).json({ error: 'Failed to delete flashcard' });
  }
});

export default router;