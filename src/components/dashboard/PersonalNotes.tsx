import { NotebookPen } from "lucide-react";
import { Folder } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchNotes, type Note } from "../../services/notesApi";

function PersonalNotes() {
  const [isShimmering, setIsShimmering] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch notes on component mount
  useEffect(() => {
    const loadNotes = async () => {
      try {
        const fetchedNotes = await fetchNotes();
        // Sort by most recent first (by createdAt)
        const sortedNotes = fetchedNotes.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setNotes(sortedNotes);
      } catch {
        // Set empty array on error so component still renders
        setNotes([]);
      } finally {
        setLoading(false);
      }
    };

    loadNotes();
  }, []);

  const handleAddNote = () => {
    // Navigate to Study Dashboard Notes tab
    navigate('/study');
  };

  const handleMouseEnter = () => {
    setIsShimmering(true);
    setTimeout(() => setIsShimmering(false), 1800);
  };

  // Get the 5 most recent notes
  const recentNotes = notes.slice(0, 5);

  return (
    <>
      <div className="widget-header">
        <NotebookPen size={25} /> Recent Notes
        <button 
          className="header-square-btn btn-base"
          onClick={handleAddNote}
          onMouseEnter={handleMouseEnter}
          title="Note view"
        > 
          <Folder size={18} />
          {isShimmering && <div className="header-btn-shimmer" />}
        </button>
      </div>
      <div className="widget-content" style={{ gap: '8px' }}>
        {loading ? (
          <div className="widget-row">Loading notes...</div>
        ) : recentNotes.length > 0 ? (
          recentNotes.map((note) => (
            <div key={note.id} className="widget-row" title={note.content}>
              {note.title || 'Untitled Note'}
            </div>
          ))
        ) : (
          <div className="widget-row">No notes yet. Create your first note!</div>
        )}
      </div>
    </>
  );
}

export default PersonalNotes;