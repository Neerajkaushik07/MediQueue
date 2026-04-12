import React, { useState, useRef, useEffect, useContext } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FiSend, FiPaperclip, FiMic, FiMoreVertical, FiVideo, FiPhone, FiArrowLeft, FiInfo, FiFileText, FiCalendar, FiTrash2 } from 'react-icons/fi';
import { io } from 'socket.io-client';
import { AppContext } from '../../context/AppContext';

const socket = io(import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000', { autoConnect: false });

const Telemedicine = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { userData, userRole, doctors } = useContext(AppContext);

    // Prioritize URL parameter to allow manual switching via the button
    const role = searchParams.get('role') || userRole || 'patient';

    // Use URL params for real appointment context, or fallback to individual user demo room
    const urlRoomId = searchParams.get('roomId');
    const partnerId = searchParams.get('partnerId');

    const [partnerIdState, setPartnerIdState] = useState(partnerId || null);

    useEffect(() => {
        if (!partnerIdState) {
            if (role === 'patient' && doctors && doctors.length > 0) {
                setPartnerIdState(doctors[0]._id);
            } else if (role === 'doctor') {
                setPartnerIdState(userData?._id || 'patient_demo_1');
            }
        }
    }, [doctors, role, partnerIdState, userData]);

    // Determine sender and receiver IDs correctly depending on if they are simulating the other side
    // When simulating doctor view, the "Sender" should be the Doctor they were talking to.
    const simulatedDoctorId = searchParams.get('simulateDoctor');
    const senderId = role === 'doctor'
        ? (userRole === 'doctor' ? userData?._id : (simulatedDoctorId || 'doctor_demo_1'))
        : (userRole === 'patient' ? userData?._id : 'patient_demo_1');

    const actualPartnerId = partnerIdState || (role === 'doctor' ? (userRole === 'patient' ? userData?._id : 'patient_demo_1') : 'doctor_demo_1');

    // Create unique room ID for the pair, sorted so both users get the same room string
    const roomId = urlRoomId || `chat_${[senderId, actualPartnerId].sort().join('_')}`;

    // When switching roles dynamically, use appropriate IDs
    const senderType = role === 'doctor' ? 'Doctor' : 'User';
    const receiverId = actualPartnerId;
    const receiverType = role === 'doctor' ? 'User' : 'Doctor';

    // Partner info for UI
    const selectedDoctor = doctors?.find(d => d._id === actualPartnerId);
    const partnerName = role === 'doctor' ? (actualPartnerId === userData?._id ? (userData?.name || 'Current Patient') : 'John Demo') : (selectedDoctor?.name || 'Loading Doctor...');
    const partnerImg = role === 'doctor' ? `https://ui-avatars.com/api/?name=${encodeURIComponent(partnerName)}&background=0D8ABC&color=fff` : (selectedDoctor?.image || `https://ui-avatars.com/api/?name=${encodeURIComponent('Doctor')}&background=0D8ABC&color=fff`);

    // Mock patient list for doctor view
    const patientChats = [
        { _id: userData?._id || 'patient_demo_1', name: userData?.name || 'Current Patient', lastMsg: 'Tap to view chat' },
        { _id: 'patient_demo_2', name: 'Jane Smith', lastMsg: 'When is my report coming?' },
    ];

    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
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
                isMine: data.senderType === senderType || data.senderId === senderId,
                text: data.text,
                messageType: data.messageType || 'text',
                imageUrl: data.imageUrl,
                isDeleted: data.isDeleted,
                timestamp: new Date(data.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setMessages((prev) => {
                // Prevent duplicates
                if (prev.some(m => m.id === newMsg.id)) return prev;
                return [...prev, newMsg];
            });
        });

        // Listen for deletions
        socket.on('message_deleted', (data) => {
            setMessages((prev) =>
                prev.map((msg) =>
                    msg.id === data.id ? { ...msg, isDeleted: true } : msg
                )
            );
        });

        // Fetch history first to prevent UI replacement race conditions
        fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'}/api/chat/history/${roomId}`)
            .then(res => res.json())
            .then(data => {
                if (!isMounted) return;

                if (data.success && data.messages.length > 0) {
                    const formatted = data.messages.map(m => ({
                        id: m._id,
                        isMine: m.senderType === senderType || m.senderId === senderId,
                        text: m.text,
                        messageType: m.messageType || 'text',
                        imageUrl: m.imageUrl,
                        isDeleted: m.isDeleted,
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
            socket.off('message_deleted');
        };
    }, [roomId, senderId, senderType]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (message.trim() === '') return;

        socket.emit('send_message', {
            senderId,
            senderType,
            receiverId,
            receiverType,
            roomId,
            text: message,
            messageType: 'text'
        });

        setMessage('');
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('image', file);

        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'}/api/chat/upload-image`, {
                method: 'POST',
                body: formData,
            });
            const data = await response.json();

            if (data.success) {
                socket.emit('send_message', {
                    senderId,
                    senderType,
                    receiverId,
                    receiverType,
                    roomId,
                    text: 'Image Attachment',
                    messageType: 'image',
                    imageUrl: data.imageUrl
                });
            } else {
                console.error('Failed to upload image:', data.message);
            }
        } catch (error) {
            console.error('Error uploading image:', error);
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleDeleteMessage = (messageId) => {
        socket.emit('delete_message', {
            messageId,
            senderId,
            roomId
        });
    };

    return (
        <div className="flex flex-col md:flex-row h-[85vh] gap-4 mb-10 mt-6 max-w-7xl mx-auto animate-fade-in-up">
            {/* Contacts Sidebar */}
            <div className="hidden md:flex flex-col w-1/3 max-w-sm gap-4 bg-white dark:bg-gray-800 border border-gray-100 rounded-xl overflow-hidden shadow-soft">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between shadow-sm dark:shadow-none z-10">
                    <button onClick={() => navigate('/features')} className="text-gray-500 dark:text-gray-400 hover:text-primary transition-colors flex items-center">
                        <FiArrowLeft size={18} className="mr-1" />
                    </button>
                    <h2 className="font-bold text-gray-800 dark:text-gray-100 text-lg">Chats</h2>
                    <FiMoreVertical className="text-gray-400 cursor-pointer hover:text-primary" />
                </div>

                <div className="flex-1 overflow-y-auto hide-scrollbar">
                    {role === 'patient' ? (
                        doctors?.map(doc => (
                            <div
                                key={doc._id}
                                onClick={() => setPartnerIdState(doc._id)}
                                className={`p-4 flex items-center gap-3 cursor-pointer border-b border-gray-50 transition-all ${actualPartnerId === doc._id ? 'bg-primary/5 border-l-4 border-l-primary' : 'hover:bg-gray-50 dark:bg-gray-900 border-l-4 border-l-transparent'}`}
                            >
                                <div className="relative">
                                    <img src={doc.image} alt={doc.name} className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm dark:shadow-none" />
                                    <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${isConnected && actualPartnerId === doc._id ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className={`font-medium text-sm truncate ${actualPartnerId === doc._id ? 'text-primary' : 'text-gray-900 dark:text-white'}`}>{doc.name}</h4>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{doc.speciality}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        patientChats.map(patient => (
                            <div
                                key={patient._id}
                                onClick={() => setPartnerIdState(patient._id)}
                                className={`p-4 flex items-center gap-3 cursor-pointer border-b border-gray-50 transition-all ${actualPartnerId === patient._id ? 'bg-primary/5 border-l-4 border-l-primary' : 'hover:bg-gray-50 dark:bg-gray-900 border-l-4 border-l-transparent'}`}
                            >
                                <div className="relative">
                                    <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(patient.name)}&background=0D8ABC&color=fff`} alt={patient.name} className="w-12 h-12 rounded-full border-2 border-white shadow-sm dark:shadow-none" />
                                    <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${isConnected && actualPartnerId === patient._id ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className={`font-medium text-sm truncate ${actualPartnerId === patient._id ? 'text-primary' : 'text-gray-900 dark:text-white'}`}>{patient.name}</h4>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{patient.lastMsg}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-900 text-xs text-center text-gray-400 border-t border-gray-100 flex flex-col gap-1">
                    <span>Viewing as: <b className="text-gray-600 dark:text-gray-300">{role.toUpperCase()}</b></span>
                    <a href={`?role=${role === 'patient' ? 'doctor' : 'patient'}${(role === 'patient' && actualPartnerId) ? '&simulateDoctor=' + actualPartnerId : ''}`} className="text-primary hover:underline font-medium">
                        Switch to {role === 'patient' ? 'Doctor' : 'Patient'} view
                    </a>
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col bg-white dark:bg-gray-800 rounded-xl shadow-soft border border-gray-100 overflow-hidden relative">
                {/* Chat Header */}
                <div className="h-16 px-4 md:px-6 border-b border-gray-100 flex items-center justify-between bg-white dark:bg-gray-800 z-10 shadow-sm dark:shadow-none">
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate('/features')} className="md:hidden text-gray-500 dark:text-gray-400 hover:text-primary p-2 -ml-2">
                            <FiArrowLeft size={20} />
                        </button>
                        <div className="relative">
                            <img src={partnerImg} alt="Profile" className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-gray-700" />
                            <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 ${isConnected ? 'bg-green-500' : 'bg-gray-400'} border-2 border-white rounded-full`}></span>
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 dark:text-white text-sm md:text-base">{partnerName}</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                {isConnected ? <span className="text-green-500">• Connected</span> : <span>• Connecting...</span>}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button disabled className="p-2.5 bg-gray-50 dark:bg-gray-900 text-gray-400 rounded-full hidden sm:block">
                            <FiPhone size={18} />
                        </button>
                        <button disabled className="p-2.5 bg-gray-50 dark:bg-gray-900 text-gray-400 rounded-full">
                            <FiVideo size={18} />
                        </button>
                        <button className="p-2.5 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:text-white transition-colors">
                            <FiMoreVertical size={18} />
                        </button>
                    </div>
                </div>

                {/* Chat Feed */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-gradient-to-b from-gray-50 to-white relative hide-scrollbar">
                    {/* Timestamp divider */}
                    <div className="flex justify-center mb-6 mt-2">
                        <span className="text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700">
                            Today
                        </span>
                    </div>

                    <div className="space-y-4">
                        {messages.map((msg) => {
                            if (msg.isDeleted) {
                                return (
                                    <div key={msg.id} className={`flex ${msg.isMine ? 'justify-end' : 'justify-start'} animate-slide-up`}>
                                        <div className="max-w-[85%] sm:max-w-[70%] rounded-2xl px-4 py-2 border border-gray-100 bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 italic text-sm">
                                            This message was deleted
                                        </div>
                                    </div>
                                );
                            }

                            return (
                                <div key={msg.id} className={`flex group ${msg.isMine ? 'justify-end' : 'justify-start'} animate-slide-up`}>
                                    {msg.isMine && msg.id !== 'welcome' && (
                                        <button
                                            onClick={() => handleDeleteMessage(msg.id)}
                                            className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 transition-opacity self-center mr-2 rounded-full hover:bg-red-50"
                                            title="Delete message"
                                        >
                                            <FiTrash2 size={14} />
                                        </button>
                                    )}
                                    <div className={`max-w-[85%] sm:max-w-[70%] rounded-2xl px-5 py-3 ${msg.isMine ? 'bg-gradient-primary text-white rounded-br-sm shadow-medical' : 'bg-white dark:bg-gray-800 border border-gray-100 text-gray-800 dark:text-gray-100 rounded-bl-sm shadow-soft'}`}>
                                        {msg.messageType === 'image' ? (
                                            <img src={msg.imageUrl} alt="Attachment" className="max-w-full h-auto rounded-lg mb-1" style={{ maxHeight: '200px' }} />
                                        ) : (
                                            <p className="text-[15px] leading-relaxed">{msg.text}</p>
                                        )}
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
                <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-100 z-10">
                    <form onSubmit={handleSendMessage} className="flex items-end gap-2">
                        <input
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            onChange={handleImageUpload}
                            className="hidden"
                            id="image-upload"
                        />
                        <button
                            type="button"
                            disabled={isUploading}
                            onClick={() => fileInputRef.current?.click()}
                            className={`p-3 text-gray-400 transition-colors hover:bg-gray-50 dark:bg-gray-900 rounded-full shrink-0 ${isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:text-primary'}`}
                            title="Attach Photo"
                        >
                            {isUploading ? <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div> : <FiPaperclip size={20} />}
                        </button>
                        <div className="flex-1 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all flex items-center overflow-hidden pr-2">
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder={`Type your message as ${role}...`}
                                className="w-full bg-transparent px-4 py-3 outline-none resize-none max-h-32 min-h-[48px] text-gray-700 dark:text-gray-200 text-sm overflow-hidden"
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
                            className={`p-3.5 rounded-full shrink-0 shadow-soft transition-all duration-300 ${message.trim() ? 'bg-gradient-primary text-white hover:shadow-medical hover:scale-105' : 'bg-gray-100 dark:bg-gray-800 text-gray-400 pointer-events-none'}`}
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
