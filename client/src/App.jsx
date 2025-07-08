import React, { useState, useEffect, useRef } from 'react';
import './App.css'; // Import custom styles

// Main App component for the NilAI Chatbot UI
function App() {
    // State variables for managing chat messages, user input, loading status, and error
    const [messages, setMessages] = useState([]); // Stores chat messages
    const [userInput, setUserInput] = useState(''); // Stores the current input from the user
    const [isLoading, setIsLoading] = useState(false); // Indicates if a message is being sent/received
    const [error, setError] = useState(null); // Stores any error messages

    // Ref to keep the chat history scrolled to the bottom
    const chatHistoryRef = useRef(null);

    // Effect to scroll to the bottom of the chat history whenever messages update
    useEffect(() => {
        if (chatHistoryRef.current) {
            chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
        }
    }, [messages]);

    // Initial welcome message when the component mounts
    useEffect(() => {
        setMessages([{ text: 'Welcome! How can I help you today?', sender: 'bot' }]);
    }, []); // Empty dependency array means this runs once on mount

    /**
     * Handles sending the user's message to the chatbot backend.
     * It updates the chat history, sends a POST request, and displays the bot's reply.
     */
    const sendMessage = async () => {
        const message = userInput.trim();
        if (message === '') {
            return; // Prevent sending empty messages
        }

        // Add user's message to the chat history
        setMessages(prevMessages => [...prevMessages, { text: message, sender: 'user' }]);
        setUserInput(''); // Clear the input field

        setIsLoading(true); // Show loading indicator
        setError(null); // Clear any previous errors

        try {
            // Send the message to the backend server
            const response = await fetch('http://localhost:5050/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: message }),
            });

            // Check if the response was successful
            if (!response.ok) {
                // If not successful, throw an error with the status
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // Parse the JSON response
            const data = await response.json();

            // Add the bot's reply to the chat history
            if (data.reply) {
                setMessages(prevMessages => [...prevMessages, { text: data.reply, sender: 'bot' }]);
            } else {
                // Handle cases where the bot's reply is not in the expected format
                setMessages(prevMessages => [...prevMessages, { text: "Oops! The chatbot didn't return a valid reply.", sender: 'bot' }]);
            }
        } catch (err) {
            // Log the error and display an error message to the user
            console.error('Error fetching chatbot reply:', err);
            setError("Sorry, I'm having trouble connecting to the chatbot. Please try again later.");
            setMessages(prevMessages => [...prevMessages, { text: "Sorry, I'm having trouble connecting to the chatbot. Please try again later.", sender: 'bot' }]);
        } finally {
            // Hide loading indicator regardless of success or failure
            setIsLoading(false);
        }
    };

    /**
     * Handles key press events in the input field.
     * Triggers sendMessage if the Enter key is pressed.
     * @param {Object} event - The keyboard event.
     */
    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            sendMessage();
        }
    };

    return (
        <div className="bg-gradient-to-br from-purple-50 to-indigo-100 min-h-screen w-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 font-inter overflow-hidden">
            {/* Main Chat Container */}
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-4 sm:p-6 lg:p-8 w-[95%] max-w-7xl mx-auto flex flex-col h-[90vh] border border-white/20 glassmorph">
                <h1 className="text-4xl font-black text-center bg-gradient-to-r from-green-400 to-blue-600 text-transparent bg-clip-text mb-8 tracking-tight animate-fade-in flex items-center justify-center gap-4">
                    <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-blue-500 shadow-lg mr-2 animate-bounce nilai-avatar">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 32 32" className="w-8 h-8 text-white"><circle cx="16" cy="16" r="16" fill="url(#nilai-gradient)"/><defs><linearGradient id="nilai-gradient" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse"><stop stopColor="#34d399"/><stop offset="1" stopColor="#2563eb"/></linearGradient></defs><text x="8" y="22" fontSize="14" fill="white" fontFamily="Arial" fontWeight="bold">N</text></svg>
                    </span>
                    NilAI
                </h1>

                {/* Chat History Display Area */}
                <div
                    id="chat-history"
                    ref={chatHistoryRef} // Assign the ref here
                    className="flex-1 bg-gray-50/50 backdrop-blur-sm p-6 rounded-2xl mb-6 overflow-y-auto shadow-inner border border-gray-200/50 chat-history space-y-6" // Added custom scrollbar class
                >
                    {/* Map through messages and render them */}
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex items-end space-x-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}>
                            {msg.sender === 'bot' && <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white text-lg font-extrabold shadow-md border-2 border-white nilai-avatar">N</div>}
                            <div className={`p-4 rounded-2xl shadow-lg max-w-[80%] transform transition-all duration-200 hover:scale-[1.02] ${msg.sender === 'user' ? 'bubble-user' : 'bubble-bot'}`}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Message Input and Send Button */}
                <div className="flex items-center space-x-4 bg-gray-50/30 p-4 rounded-2xl backdrop-blur-sm border border-gray-200/50">
                    <input
                        type="text"
                        id="user-input"
                        placeholder="Type your message here..."
                        className="flex-1 p-4 input-glass border-2 border-purple-100 rounded-xl focus:ring-4 focus:ring-purple-200 focus:border-purple-300 transition-all duration-300 ease-out shadow-sm text-gray-800 placeholder-gray-400 outline-none"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        disabled={isLoading}
                    />
                    <button
                        id="send-button"
                        onClick={sendMessage}
                        className="bg-gradient-to-r from-green-400 to-blue-500 text-white font-bold py-4 px-6 rounded-xl shadow-lg transition-all duration-300 ease-out transform hover:scale-105 hover:shadow-xl focus:outline-none hover:ring-4 hover:ring-green-200/60 focus:ring-4 focus:ring-blue-200/60 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <span className="flex items-center">
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Sending
                            </span>
                        ) : 'Send'}
                    </button>
                </div>
                {isLoading && (
                    <div id="loading-indicator" className="text-center text-purple-600 mt-4 animate-pulse font-medium">
                        AI is thinking...
                    </div>
                )}
                {error && (
                    <div id="error-message" className="text-center text-red-500 mt-4 bg-red-50 p-3 rounded-xl border border-red-100 animate-fade-in">
                        {error}
                    </div>
                )}
            </div>
        </div>
    );
}

export default App;

