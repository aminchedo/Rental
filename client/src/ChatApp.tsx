import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PersianChatPage from './pages/PersianChatPage';

const ChatApp: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PersianChatPage />} />
        <Route path="/chat" element={<PersianChatPage />} />
      </Routes>
    </Router>
  );
};

export default ChatApp;
