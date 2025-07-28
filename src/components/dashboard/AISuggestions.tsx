import { BotMessageSquare } from "lucide-react";

function AISuggestions() {
  return (
    <>
      <div className="widget-header">
        <BotMessageSquare size={25} /> AI Suggestions
      </div>
      <div className="widget-content" style={{ gap: '8px' }}>
        <div className="widget-row">Suggestion 1 ...</div>
        <div className="widget-row">Suggestion 2 ...</div>
        <div className="widget-row">Suggestion 3 ...</div>
      </div>
    </>
  );
}

export default AISuggestions;