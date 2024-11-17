import React from "react";

export function ChatWindow() {
  return (
    <div className="border rounded-md p-4 h-64 overflow-y-auto">
      <div className="chat">
        <div id="chatMessages" className="chat__messages"></div>
        <div id="errorContainer" className="chat__error" style={{ display: 'none' }}></div>
        <div id="typingIndicator" className="chat__typing" style={{ display: 'none' }}>
          Assistant is typing...
          <button id="cancelButton" className="chat__cancel-btn">Cancel</button>
        </div>
      </div>
    </div>
  )
}
