import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FiSend, FiPaperclip, FiMic, FiMoreVertical, FiVideo, FiPhone, FiArrowLeft, FiInfo, FiFileText, FiCalendar } from 'react-icons/fi';
import { io } from 'socket.io-client';

const socket = io(import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000', { autoConnect: false });

const Telemedicine = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const role = searchParams.get('role') || 'patient';
    
    // Demo identifiers
    const roomId = 'demo_consultation_101';
    const senderId = role === 'doctor' ? 'doctor_demo_1' : 'patient_demo_1';
    const senderType = role === 'doctor' ? 'Doctor' : 'User';
    const receiverId = role === 'doctor' ? 'patient_demo_1' : 'doctor_demo_1';
    const receiverType = role === 'doctor' ? 'User' : 'Doctor';

    const messagesEndRef = useRef(null);

    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [isConnected, setIsConnected] = useState(socket.connected);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        let isMounted = true;
        
        socket.on('connect', () => setIsConnected(true));
        socket.on('disconnect', () => setIsConnected(false));

        // Listen for incoming dynamic messages
        socket.on('receive_message', (data) => {
            const newMsg = {
                id: data.id,
                isMine: data.senderId === senderId,
                text: data.text,
                timestamp: new Date(data.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setMessages((prev) => {
                // Prevent duplicates
                if (prev.some(m => m.id === newMsg.id)) return prev;
                return [...prev, newMsg];
            });
        });

        // Fetch history first to prevent UI replacement race conditions
        fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'}/api/chat/history/${roomId}`)
            .then(res => res.json())
            .then(data => {
                if (!isMounted) return;
                
                if (data.success && data.messages.length > 0) {
                     const formatted = data.messages.map(m => ({
                         id: m._id,
                         isMine: m.senderId === senderId,
                         text: m.text,
                         timestamp: new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                     }));
                     setMessages(formatted);
                } else if (data.success && data.messages.length === 0) {
                     setMessages([
                        { id: 'welcome', isMine: false, text: 'Welcome to the MediQueue real-time consultation room!', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
                     ]);
                }
                
                // Connect socket ONLY after array logic resolves
                socket.connect();
                socket.emit('join_room', roomId);
            })
            .catch(err => {
                console.error('Error fetching chat history:', err);
                socket.connect();
                socket.emit('join_room', roomId);
            });

        return () => {
            isMounted = false;
            socket.disconnect();
            socket.off('connect');
            socket.off('disconnect');
            socket.off('receive_message');
        };
    }, [roomId, senderId]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (message.trim() === '') return;

        socket.emit('send_message', {
            senderId,
            senderType,
            receiverId,
            receiverType,
            roomId,
            text: message
        });

        setMessage('');
    };

    return (
        <div className="flex flex-col md:flex-row h-[85vh] gap-4 mb-10 mt-6 max-w-7xl mx-auto animate-fade-in-up">
            {/* Sidebar Details */}
            <div className="hidden md:flex flex-col w-1/3 max-w-sm gap-4">
                <div className="medical-card p-6 bg-white flex flex-col items-center">
                    <button onClick={() => navigate('/features')} className="self-start text-gray-500 hover:text-primary mb-4 flex items-center transition-colors">
                        <FiArrowLeft className="mr-2" /> Back
                    </button>
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-calm-blue to-care-green overflow-hidden mb-4 p-1 shadow-soft">
                        <img src={`https://ui-avatars.com/api/?name=${role==='doctor'?'Jane+Doe':'Richard+James'}&background=0D8ABC&color=fff`} alt="Profile" className="w-full h-full rounded-full object-cover" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">{role === 'doctor' ? 'Patient Jane' : 'Dr. Richard James'}</h2>
                    <p className="text-primary font-medium text-sm mb-2">{role === 'doctor' ? 'User Profile' : 'General Physician'}</p>
                    <div className="flex items-center gap-2 mb-6">
                         <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                         <span className="text-sm text-gray-600">{isConnected ? 'Server Connected' : 'Disconnected'}</span>
                    </div>

                    <div className="w-full space-y-3">
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 text-gray-700">
                            <FiCalendar className="text-primary" />
                            <div className="text-sm">
                                <p className="font-semibold text-gray-900">Today</p>
                                <p className="text-xs text-gray-500">Live Consultation</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 text-gray-700">
                            <FiFileText className="text-primary" />
                            <div className="text-sm">
                                <p className="font-semibold text-gray-900">Room ID</p>
                                <p className="text-xs text-gray-500">{roomId}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="mt-4 text-xs text-center text-gray-400">
                        Viewing as: <b>{role.toUpperCase()}</b>
                        <br/>
                        <a href={`?role=${role === 'patient' ? 'doctor' : 'patient'}`} className="text-primary underline mt-1 block">
                            Switch to {role === 'patient' ? 'Doctor' : 'Patient'} view
                        </a>
                    </div>
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col bg-white rounded-xl shadow-soft border border-gray-100 overflow-hidden relative">
                {/* Chat Header */}
                <div className="h-16 px-4 md:px-6 border-b border-gray-100 flex items-center justify-between bg-white z-10 shadow-sm">
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate('/features')} className="md:hidden text-gray-500 hover:text-primary p-2 -ml-2">
                             <FiArrowLeft size={20} />
                        </button>
                        <div className="relative md:hidden">
                            <img src={`https://ui-avatars.com/api/?name=${role==='doctor'?'Jane+Doe':'Richard+James'}&background=0D8ABC&color=fff`} alt="Profile" className="w-10 h-10 rounded-full" />
                            <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 ${isConnected ? 'bg-green-500' : 'bg-red-500'} border-2 border-white rounded-full`}></span>
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">{role === 'doctor' ? 'Patient Jane' : 'Dr. Richard James'}</h3>
                            <p className="text-xs text-gray-500">Live Real-time Socket</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="p-2.5 bg-gray-50 hover:bg-calm-blue text-primary rounded-full transition-colors hidden sm:block shadow-sm">
                            <FiPhone size={18} />
                        </button>
                        <button className="p-2.5 bg-gradient-primary text-white rounded-full shadow-medical hover:shadow-card-hover transition-all">
                            <FiVideo size={18} />
                        </button>
                        <button className="p-2.5 text-gray-500 hover:text-gray-900 transition-colors">
                            <FiMoreVertical size={20} />
                        </button>
                    </div>
                </div>

                {/* Chat Feed */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-gradient-to-b from-gray-50 to-white relative hide-scrollbar">
                    {/* Timestamp divider */}
                    <div className="flex justify-center mb-6 mt-2">
                        <span className="text-xs font-medium bg-gray-100 text-gray-500 px-3 py-1.5 rounded-full border border-gray-200">
                            Today
                        </span>
                    </div>

                    <div className="space-y-4">
                        {messages.map((msg) => {
                            return (
                                <div key={msg.id} className={`flex ${msg.isMine ? 'justify-end' : 'justify-start'} animate-slide-up`}>
                                    <div className={`max-w-[85%] sm:max-w-[70%] rounded-2xl px-5 py-3 ${msg.isMine ? 'bg-gradient-primary text-white rounded-br-sm shadow-medical' : 'bg-white border border-gray-100 text-gray-800 rounded-bl-sm shadow-soft'}`}>
                                        <p className="text-[15px] leading-relaxed">{msg.text}</p>
                                        <p className={`text-[11px] mt-1.5 flex items-center ${msg.isMine ? 'text-blue-100 justify-end' : 'text-gray-400 justify-start'}`}>
                                             {msg.timestamp}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>
                </div>

                {/* Input Bar */}
                <div className="p-4 bg-white border-t border-gray-100 z-10">
                    <form onSubmit={handleSendMessage} className="flex items-end gap-2">
                        <button type="button" className="p-3 text-gray-400 hover:text-primary transition-colors hover:bg-gray-50 rounded-full shrink-0" title="Attach Patient Documents">
                            <FiPaperclip size={20} />
                        </button>
                        <div className="flex-1 bg-gray-50 rounded-2xl border border-gray-200 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all flex items-center overflow-hidden pr-2">
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder={`Type your message as ${role}...`}
                                className="w-full bg-transparent px-4 py-3 outline-none resize-none max-h-32 min-h-[48px] text-gray-700 text-sm overflow-hidden"
                                rows="1"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSendMessage(e);
                                    }
                                }}
                            />
                            <button type="button" className="p-2 text-gray-400 hover:text-primary transition-colors mx-1">
                                <FiMic size={20} />
                            </button>
                        </div>
                        <button 
                            type="submit" 
                            disabled={!message.trim()}
                            className={`p-3.5 rounded-full shrink-0 shadow-soft transition-all duration-300 ${message.trim() ? 'bg-gradient-primary text-white hover:shadow-medical hover:scale-105' : 'bg-gray-100 text-gray-400 pointer-events-none'}`}
                        >
                            <FiSend size={18} className={message.trim() ? 'translate-x-0.5 -translate-y-0.5' : ''} />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Telemedicine;
