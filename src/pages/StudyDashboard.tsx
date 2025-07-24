import React, { useState } from 'react';
import './StudyDashboard.css';
import Navbar from '../components/NavBar';
import { BookOpen, StickyNote, Search } from 'lucide-react';
import { useNotes } from '../services/notesContext';
import { useFlashcards } from '../services/flashcardsContext';

// Tab types
type TabType = 'flashcards' | 'notes';

const StudyDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('notes');

  return (
    <>
      <Navbar />
      <div className="study-dashboard-page">
        {/* Tab switcher */}
        <div className="tab-switcher">
          <button
            className={`tab-button ${activeTab === 'notes' ? 'active' : ''}`}
            onClick={() => setActiveTab('notes')}
          >
            <StickyNote size={20} />
            Notes
          </button>
          <button
            className={`tab-button ${activeTab === 'flashcards' ? 'active' : ''}`}
            onClick={() => setActiveTab('flashcards')}
          >
            <BookOpen size={20} />
            Flash Cards
          </button>
        </div>

        {/* Tab content */}
        <div className="tab-content">
          {activeTab === 'notes' && <NotesTab />}
          {activeTab === 'flashcards' && <FlashCardsTab />}
        </div>
      </div>
    </>
  );
};

// Flash cards tab component  
const FlashCardsTab: React.FC = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [newFlashcardFront, setNewFlashcardFront] = useState('');
  const [newFlashcardBack, setNewFlashcardBack] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingFlashcard, setEditingFlashcard] = useState<{ id: number; front: string; back: string } | null>(null);

  // Use flashcards context
  const { flashcards, addFlashcard, removeFlashcard, updateFlashcard, isLoading } = useFlashcards();

  const handleAddFlashcard = async () => {
    if (newFlashcardFront.trim() || newFlashcardBack.trim()) {
      try {
        if (editingFlashcard) {
          await updateFlashcard(editingFlashcard.id, newFlashcardFront.trim() || 'Untitled Front', newFlashcardBack.trim());
        } else {
          await addFlashcard(newFlashcardFront.trim() || 'Untitled Front', newFlashcardBack.trim());
        }
        closeModal();
      } catch (error) {
        console.error('Failed to save flashcard:', error);
      }
    }
  };

  const handleDeleteFlashcard = async (id: number, event: React.MouseEvent) => {
    const flashcardElement = (event.target as HTMLElement).closest('.note-box');
    if (flashcardElement) {
      flashcardElement.classList.add('deleting');
      
      setTimeout(async () => {
        try {
          await removeFlashcard(id);
        } catch (error) {
          console.error('Failed to delete flashcard:', error);
          flashcardElement.classList.remove('deleting');
        }
      }, 400);
    }
  };

  const handleEditFlashcard = (flashcard: { id: number; front: string; back: string }) => {
    setEditingFlashcard(flashcard);
    setNewFlashcardFront(flashcard.front);
    setNewFlashcardBack(flashcard.back);
    setShowCreateModal(true);
  };

  const closeModal = () => {
    setIsClosing(true);
    setTimeout(() => {
      setShowCreateModal(false);
      setIsClosing(false);
      setNewFlashcardFront('');
      setNewFlashcardBack('');
      setEditingFlashcard(null);
    }, 250);
  };

  const cancelCreate = () => {
    closeModal();
  };

  // Search flashcards
  const filteredFlashcards = flashcards.filter(flashcard =>
    flashcard.front.toLowerCase().includes(searchQuery.toLowerCase()) ||
    flashcard.back.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="notes-container">
      {/* Search bar */}
      <div className="notes-search-section">
        <div className="search-input-container">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search flashcards..."
            className="notes-search-bar"
          />
        </div>
      </div>

      {/* Flashcards grid container */}
      <div className="notes-grid-container">
        <div className="notes-grid">
          {/* Add new flashcard button */}
          <div 
            className="note-box add-note-box"
            onClick={() => setShowCreateModal(true)}
          >
            <div className="add-note-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C13.1 2 14 2.9 14 4V10H20C21.1 10 22 10.9 22 12C22 13.1 21.1 14 20 14H14V20C14 21.1 13.1 22 12 22C10.9 22 10 21.1 10 20V14H4C2.9 14 2 13.1 2 12C2 10.9 2.9 10 4 10H10V4C10 2.9 10.9 2 12 2Z"/>
              </svg>
            </div>
            <div className="add-note-text">Add New Flashcard</div>
          </div>

          {/* Filtered flashcards */}
          {filteredFlashcards.map((flashcard) => (
            <div 
              key={flashcard.id} 
              className="note-box"
              onClick={() => handleEditFlashcard(flashcard)}
            >
              <div className="note-box-header">
                <h4 className="note-box-title">{flashcard.front}</h4>
                <button 
                  className="note-box-delete"
                  onClick={(e) => { e.stopPropagation(); handleDeleteFlashcard(flashcard.id, e); }}
                >
                  ×
                </button>
              </div>
              <div className="note-box-content">
                {flashcard.back}
              </div>
              <div className="note-box-date">{flashcard.date}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Create/edit flashcard form */}
      {showCreateModal && (
        <div className={`note-creation-modal ${isClosing ? 'closing' : ''}`}>
          <div className="note-creation-form">
            <h3>{editingFlashcard ? 'Edit Flashcard' : 'Create New Flashcard'}</h3>
            <input
              type="text"
              value={newFlashcardFront}
              onChange={(e) => setNewFlashcardFront(e.target.value)}
              placeholder="Front of card (question)..."
              className="note-form-input"
              autoFocus
            />
            <textarea
              value={newFlashcardBack}
              onChange={(e) => setNewFlashcardBack(e.target.value)}
              placeholder="Back of card (answer)..."
              className="note-form-textarea"
            />
            <div className="note-form-buttons">
              <button onClick={cancelCreate} className="note-form-btn note-form-cancel" disabled={isLoading}>
                Cancel
              </button>
              <button onClick={handleAddFlashcard} className="note-form-btn note-form-save" disabled={isLoading}>
                {isLoading ? 'Saving...' : (editingFlashcard ? 'Update Flashcard' : 'Save Flashcard')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Notes tab component
const NotesTab: React.FC = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingNote, setEditingNote] = useState<{ id: number; title: string; content: string } | null>(null);

  // Use notes context (like goals)
  const { notes, addNote, removeNote, updateNote, isLoading } = useNotes();

  const handleAddNote = async () => {
    if (newNoteTitle.trim() || newNoteContent.trim()) {
      try {
        if (editingNote) {
          // Update existing note
          await updateNote(editingNote.id, newNoteTitle.trim() || 'Untitled Note', newNoteContent.trim());
        } else {
          // Create new note
          await addNote(newNoteTitle.trim() || 'Untitled Note', newNoteContent.trim());
        }
        closeModal();
      } catch (error) {
        console.error('Failed to save note:', error);
        // Error is already handled by context
      }
    }
  };

  const handleDeleteNote = async (id: number, event: React.MouseEvent) => {
    const noteElement = (event.target as HTMLElement).closest('.note-box');
    if (noteElement) {
      noteElement.classList.add('deleting');
      
      // Wait for animation to complete before actually deleting
      setTimeout(async () => {
        try {
          await removeNote(id);
        } catch (error) {
          console.error('Failed to delete note:', error);
          // Remove the deleting class if deletion failed
          noteElement.classList.remove('deleting');
        }
      }, 400); // Match the animation duration
    }
  };

  const handleEditNote = (note: { id: number; title: string; content: string }) => {
    setEditingNote(note);
    setNewNoteTitle(note.title);
    setNewNoteContent(note.content);
    setShowCreateModal(true);
  };

  const closeModal = () => {
    setIsClosing(true);
    setTimeout(() => {
      setShowCreateModal(false);
      setIsClosing(false);
      setNewNoteTitle('');
      setNewNoteContent('');
      setEditingNote(null);
    }, 250); // Match the animation duration
  };

  const cancelCreate = () => {
    closeModal();
  };

  // Filter notes based on search query
  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="notes-container">
      {/* Search bar */}
      <div className="notes-search-section">
        <div className="search-input-container">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes..."
            className="notes-search-bar"
          />
        </div>
      </div>

      {/* Notes grid container */}
      <div className="notes-grid-container">
        <div className="notes-grid">
          {/* Add new note button (top-left) */}
          <div 
            className="note-box add-note-box"
            onClick={() => setShowCreateModal(true)}
          >
            <div className="add-note-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C13.1 2 14 2.9 14 4V10H20C21.1 10 22 10.9 22 12C22 13.1 21.1 14 20 14H14V20C14 21.1 13.1 22 12 22C10.9 22 10 21.1 10 20V14H4C2.9 14 2 13.1 2 12C2 10.9 2.9 10 4 10H10V4C10 2.9 10.9 2 12 2Z"/>
              </svg>
            </div>
            <div className="add-note-text">Add New Note</div>
          </div>

          {/* Filtered notes */}
          {filteredNotes.map((note) => (
            <div 
              key={note.id} 
              className="note-box"
              onClick={() => handleEditNote(note)}
            >
              <div className="note-box-header">
                <h4 className="note-box-title">{note.title}</h4>
                <button 
                  className="note-box-delete"
                  onClick={(e) => { e.stopPropagation(); handleDeleteNote(note.id, e); }}
                >
                  ×
                </button>
              </div>
              <div className="note-box-content">
                {note.content}
              </div>
              <div className="note-box-date">{note.date}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Create/edt note form */}
      {showCreateModal && (
        <div className={`note-creation-modal ${isClosing ? 'closing' : ''}`}>
          <div className="note-creation-form">
            <h3>{editingNote ? 'Edit Note' : 'Create New Note'}</h3>
            <input
              type="text"
              value={newNoteTitle}
              onChange={(e) => setNewNoteTitle(e.target.value)}
              placeholder="Note title..."
              className="note-form-input"
              autoFocus
            />
            <textarea
              value={newNoteContent}
              onChange={(e) => setNewNoteContent(e.target.value)}
              placeholder="Write your note here..."
              className="note-form-textarea"
            />
            <div className="note-form-buttons">
              <button onClick={cancelCreate} className="note-form-btn note-form-cancel" disabled={isLoading}>
                Cancel
              </button>
              <button onClick={handleAddNote} className="note-form-btn note-form-save" disabled={isLoading}>
                {isLoading ? 'Saving...' : (editingNote ? 'Update Note' : 'Save Note')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyDashboard;
