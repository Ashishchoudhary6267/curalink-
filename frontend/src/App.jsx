import { useState } from 'react';
import Sidebar from './components/Sidebar';
import ChatHistory from './components/ChatHistory';
import InputArea from './components/InputArea';
import './App.css';

function App() {
  // The "Boss" holds the memory
  const [context, setContext] = useState({ name: '', disease: '', location: '' });
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="app-container">
      {/* Pass the state to the Sidebar so it can update it */}
      <Sidebar context={context} setContext={setContext} />

      <div className="chat-container">
        {/* Pass the messages to the ChatHistory so it can display them */}
        <ChatHistory chatHistory={chatHistory} isLoading={isLoading} />
        
        {/* Pass a function to the InputArea so it can trigger the AI */}
        <InputArea 
           context={context} 
           chatHistory={chatHistory} 
           setChatHistory={setChatHistory} 
           setIsLoading={setIsLoading} 
           isLoading={isLoading}
        />
      </div>
    </div>
  );
}

export default App;