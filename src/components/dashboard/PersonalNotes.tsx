import { NotebookPen } from "lucide-react";
import { Folder } from "lucide-react";
import { useState } from "react";

function PersonalNotes() {
  const [isShimmering, setIsShimmering] = useState(false);

  const handleAddNote = () => {
    // Onclick logic
    console.log("Add note button clicked");
  };

  const handleMouseEnter = () => {
    setIsShimmering(true);
    setTimeout(() => setIsShimmering(false), 1800);
  };

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
        <div className="widget-row">This is a note ...</div>
        <div className="widget-row">This is another note ...</div>
        <div className="widget-row">Wow! A third note?! ...</div>
      </div>
    </>
  );
}

export default PersonalNotes;