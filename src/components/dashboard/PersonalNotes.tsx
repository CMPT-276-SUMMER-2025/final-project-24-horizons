import { NotebookPen } from "lucide-react";

function PersonalNotes() {
  return (
    <>
      <div className="widget-header">
        <NotebookPen size={25} /> Personal Notes
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