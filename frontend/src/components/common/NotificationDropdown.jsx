import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, Info, Calendar, CreditCard, AlertCircle } from 'lucide-react';
import { notificationsAPI } from '../../services/api';

const NotificationDropdown = ({ role }) => {
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when complying outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchNotifications = async () => {
        // Only fetch for guide/admin
        if (role !== 'guide' && role !== 'admin') return;

        try {
            setLoading(true);
            let res;
            if (role === 'guide') {
                res = await notificationsAPI.getGuideNotifications();
            } else {
                res = await notificationsAPI.getAdminNotifications();
            }
            setNotifications(res.data);
        } catch (err) {
            console.error("Failed to fetch notifications", err);
        } finally {
            setLoading(false);
        }
    };

    // Initial fetch and poll every 30s
    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, [role]);

    const handleMarkRead = async (id, e) => {
        e.stopPropagation(); // prevent closing dropdown
        try {
            await notificationsAPI.markRead(id);
            // Update local state
            setNotifications(prev => prev.map(n =>
                n.id === id ? { ...n, is_read: true } : n
            ));
        } catch (err) {
            console.error("Failed to mark read", err);
        }
    };

    const unreadCount = notifications.filter(n => !n.is_read).length;

    const getIcon = (type) => {
        switch (type) {
            case 'booking': return <Calendar className="w-4 h-4 text-blue-500" />;
            case 'payment': return <CreditCard className="w-4 h-4 text-green-500" />;
            case 'complaint': return <AlertCircle className="w-4 h-4 text-red-500" />;
            default: return <Info className="w-4 h-4 text-zinc-500" />;
        }
    };

    // Only render for guide/admin
    if (role !== 'guide' && role !== 'admin') return null;

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors"
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 md:w-96 max-w-[90vw] bg-white rounded-xl shadow-xl border border-zinc-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-4 border-b border-zinc-100 flex justify-between items-center">
                        <h3 className="font-serif font-bold text-zinc-900">Notifications</h3>
                        <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">{unreadCount} Unread</span>
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length > 0 ? (
                            <div className="divide-y divide-zinc-50">
                                {notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={`p-4 hover:bg-zinc-50 transition-colors ${!notification.is_read ? 'bg-blue-50/30' : ''}`}
                                    >
                                        <div className="flex gap-3">
                                            <div className="mt-1 flex-shrink-0 w-8 h-8 rounded-full bg-white border border-zinc-100 flex items-center justify-center shadow-sm">
                                                {getIcon(notification.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start gap-2">
                                                    <p className={`text-sm ${!notification.is_read ? 'font-semibold text-zinc-900' : 'font-medium text-zinc-700'}`}>
                                                        {notification.title}
                                                    </p>
                                                    {!notification.is_read && (
                                                        <button
                                                            onClick={(e) => handleMarkRead(notification.id, e)}
                                                            className="text-zinc-400 hover:text-blue-600 transition-colors"
                                                            title="Mark as read"
                                                        >
                                                            <Check className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                                <p className="text-xs text-zinc-500 mt-0.5 line-clamp-2">
                                                    {notification.message}
                                                </p>
                                                <p className="text-[10px] text-zinc-400 mt-2 font-medium uppercase tracking-wider">
                                                    {new Date(notification.created_at).toLocaleDateString(undefined, {
                                                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-12 text-center text-zinc-400">
                                <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                <p className="text-sm">No notifications yet</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationDropdown;
