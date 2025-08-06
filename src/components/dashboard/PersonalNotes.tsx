import { NotebookPen } from "lucide-react";
import { Folder } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchNotes, type Note } from "../../services/notesApi";

/**
 * PersonalNotes component displays a widget showing the user's most recent notes
 * Provides quick access to create new notes by navigating to the study dashboard
 */
function PersonalNotes() {
  // State to manage button shimmer animation effect
  const [isShimmering, setIsShimmering] = useState(false);
  // State to store the fetched notes array
  const [notes, setNotes] = useState<Note[]>([]);
  // State to track loading status while fetching notes
  const [loading, setLoading] = useState(true);
  // Hook for programmatic navigation
  const navigate = useNavigate();

  // Fetch notes when component mounts
  useEffect(() => {
    const loadNotes = async () => {
      try {
        // Fetch notes from the API
        const fetchedNotes = await fetchNotes();
        // Sort notes by creation date (most recent first)
        const sortedNotes = fetchedNotes.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setNotes(sortedNotes);
      } catch {
        // Handle errors gracefully by setting empty array
        // This prevents the component from breaking on API failure
        setNotes([]);
      } finally {
        // Always set loading to false, regardless of success/failure
        setLoading(false);
      }
    };

    loadNotes();
  }, []);

  /**
   * Handles navigation to the study dashboard when user wants to add a note
   */
  const handleAddNote = () => {
    // Navigate to Study Dashboard Notes tab
    navigate('/study');
  };

  /**
   * Handles mouse hover effect on the folder button
   * Triggers a shimmer animation that lasts 1.8 seconds
   */
  const handleMouseEnter = () => {
    setIsShimmering(true);
    // Stop shimmer animation after 1.8 seconds
    setTimeout(() => setIsShimmering(false), 1800);
  };

  // Limit display to only the 5 most recent notes
  const recentNotes = notes.slice(0, 5);

  return (
    <>
      {/* Widget header with title and action button */}
      <div className="widget-header">
        <NotebookPen size={25} /> Recent Notes
        <button 
          className="header-square-btn btn-base"
          onClick={handleAddNote}
          onMouseEnter={handleMouseEnter}
          title="Note view"
        > 
          <Folder size={18} />
          {/* Conditional shimmer effect overlay */}
          {isShimmering && <div className="header-btn-shimmer" />}
        </button>
      </div>
      
      {/* Widget content area displaying notes or status messages */}
      <div className="widget-content" style={{ gap: '8px' }}>
        {loading ? (
          // Show loading message while fetching data
          <div className="widget-row">Loading notes...</div>
        ) : recentNotes.length > 0 ? (
          // Display recent notes if available
          recentNotes.map((note) => (
            <div key={note.id} className="widget-row" title={note.content}>
              {/* Display note title or fallback to 'Untitled Note' */}
              {note.title || 'Untitled Note'}
            </div>
          ))
        ) : (
          // Show message when no notes exist
          <div className="widget-row">No notes yet. Create your first note!</div>
        )}
      </div>
    </>
  );
}

export default PersonalNotes;