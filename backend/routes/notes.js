import express from 'express';
import dbManager from '../database/database.js';

const router = express.Router();

// Get user's notes
router.get('/', async (req, res) => {
  console.log(`📝 Notes request for user: ${req.user.email}`);
  const userId = req.user.id;
  
  try {
    const notes = await dbManager.getUserNotes(userId);
    res.json(notes);
  } catch (error) {
    console.error('❌ Database error:', error);
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

// Create a new note
router.post('/', async (req, res) => {
  console.log(`➕ Add note request for user: ${req.user.email}`);
  const userId = req.user.id;
  const { title, content } = req.body;
  
  if (!title && !content) {
    return res.status(400).json({ error: 'Title or content is required' });
  }
  
  try {
    const newNote = await dbManager.createNote(
      userId, 
      title?.trim() || 'Untitled Note', 
      content?.trim() || ''
    );
    
    console.log(`✅ Note created for ${req.user.email}: "${newNote.title}"`);
    res.status(201).json(newNote);
  } catch (error) {
    console.error('❌ Database error:', error);
    res.status(500).json({ error: 'Failed to create note' });
  }
});

// Update a note
router.put('/:id', async (req, res) => {
  console.log(`📝 Update note request for user: ${req.user.email}`);
  const userId = req.user.id;
  const noteId = parseInt(req.params.id);
  const { title, content } = req.body;
  
  try {
    const updatedNote = await dbManager.updateNote(
      noteId, 
      userId, 
      title?.trim() || 'Untitled Note', 
      content?.trim() || ''
    );
    
    if (!updatedNote) {
      return res.status(404).json({ error: 'Note not found' });
    }
    
    console.log(`✅ Note updated for ${req.user.email}: "${updatedNote.title}"`);
    res.json(updatedNote);
  } catch (error) {
    console.error('❌ Database error:', error);
    res.status(500).json({ error: 'Failed to update note' });
  }
});

// Delete a note
router.delete('/:id', async (req, res) => {
  console.log(`🗑️ Delete note request for user: ${req.user.email}`);
  const userId = req.user.id;
  const noteId = parseInt(req.params.id);
  
  try {
    const result = await dbManager.deleteNote(noteId, userId);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }
    
    console.log(`✅ Note deleted for ${req.user.email}, ID: ${noteId}`);
    res.json({ success: true, message: 'Note deleted successfully' });
  } catch (error) {
    console.error('❌ Database error:', error);
    res.status(500).json({ error: 'Failed to delete note' });
  }
});

// Search notes endpoint
router.get('/search', async (req, res) => {
  console.log(`🔍 Search notes request for user: ${req.user.email}`);
  const userId = req.user.id;
  const { q: searchTerm } = req.query;
  
  if (!searchTerm || typeof searchTerm !== 'string' || !searchTerm.trim()) {
    return res.status(400).json({ error: 'Search term is required' });
  }
  
  try {
    const notes = await dbManager.searchNotes(userId, searchTerm.trim());
    console.log(`✅ Found ${notes.length} notes for search term: "${searchTerm}"`);
    res.json(notes);
  } catch (error) {
    console.error('❌ Search error:', error);
    res.status(500).json({ error: 'Failed to search notes' });
  }
});

export default router;