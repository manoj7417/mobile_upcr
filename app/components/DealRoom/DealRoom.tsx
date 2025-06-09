import React, { useState, useRef, useEffect, FormEvent } from 'react'
import { supabase } from '../../lib/supabase'
import { useNavigate } from '@tanstack/react-router'
import { validateAccessToken } from '../../routes/api/auth'
import { useServerFn } from '@tanstack/react-start'
import { useCategory } from '../../context/CategoryContext'



// Types for our data structure
type MainCategory = 'PROJECT & CONSTRUCTION RESOURCES' | 'BUSINESS RESOURCES' | 'STUDENT RESOURCES'
type DMMainCategory = 'ALL' | MainCategory

interface SubCategory {
  name: string
  color: string
  icon: string
}

interface Deal {
  id: string
  title: string
  description: string
  sender_id: string
  created_at: string
  category: string
  status: 'active' | 'completed' | 'pending'
  sender?: {
    id: number
    name: string
    email: string
    profile_image_url?: string
  }
}

interface CurrentUser {
  id: string
  name: string
  email: string
  primaryResource: string[]
  profile_image_url?: string
}

interface DMMessage {
  id: number;
  message: string;
  sender_id: number;
  receiver_id: number;
  deal_id: number | null;
  created_at: Date;
  is_read: boolean;
  reply_to?: {
    id: string;
    title: string;
    sender_name: string;
  };
  sender?: {
    name: string
  }
}

interface DMGroup {
  userId: string;
  userName: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  dealId?: string;
  dealCategory?: string;
  dealMainCategory?: string;
  dealTitle?: string;
}

const categories: Record<MainCategory, SubCategory[]> = {
  'PROJECT & CONSTRUCTION RESOURCES': [
    { name: 'Land', color: '#64b5f6', icon: '🌍' },
    { name: 'Machines', color: '#64b5f6', icon: '🚛' },
    { name: 'Material', color: '#64b5f6', icon: '🏗️' },
    { name: 'Equipment', color: '#64b5f6', icon: '⚡' },
    { name: 'Tools', color: '#64b5f6', icon: '🔧' },
    { name: 'Manpower', color: '#64b5f6', icon: '👥' }
  ],
  'BUSINESS RESOURCES': [
    { name: 'Finance', color: '#64b5f6', icon: '💰' },
    { name: 'Tenders', color: '#64b5f6', icon: '📋' },
    { name: 'Showcase', color: '#64b5f6', icon: '🎯' },
    { name: 'Auction', color: '#64b5f6', icon: '🔨' }
  ],
  'STUDENT RESOURCES': [
    { name: 'Jobs', color: '#64b5f6', icon: '💼' },
    { name: 'E-Stores', color: '#64b5f6', icon: '🛍️' }
  ]
}

const dmCategories: Record<DMMainCategory, SubCategory[]> = {
  'ALL': [],
  ...categories
}

// Add type for Supabase real-time payload
type SupabaseRealtimePayload<T> = {
  new: T;
  old: T;
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
};

export const DealRoom = () => {
  const navigate = useNavigate()
  const { setSelectedCategory } = useCategory()
  const [selectedMainCategory, setSelectedMainCategory] = useState<MainCategory>('BUSINESS RESOURCES')
  const [selectedDMMainCategory, setSelectedDMMainCategory] = useState<DMMainCategory>('ALL')
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('Tenders')
  const [message, setMessage] = useState('')
  const [deals, setDeals] = useState<Deal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)
  const [viewMode, setViewMode] = useState<'room' | 'dm'>('room')
  const [selectedUser, setSelectedUser] = useState<CurrentUser | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const isInitialMount = useRef(true)
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null)
  const [dMMessages, setDMMessages] = useState<DMMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [dmGroups, setDmGroups] = useState<DMGroup[]>([])
  const [selectedDMSubCategory, setSelectedDMSubCategory] = useState('')
  const [isLoadingDMs, setIsLoadingDMs] = useState(false)
  const [unreadDMsCount, setUnreadDMsCount] = useState(0)
  const [replyingToDeal, setReplyingToDeal] = useState<Deal | null>(null)

  // Set initial category when component mounts
  useEffect(() => {
    setSelectedCategory(selectedSubCategory)
  }, []) // Empty dependency array means this runs once on mount

  // Listen for category changes from CircularMenu
  useEffect(() => {
    const handleCategoryChange = (event: CustomEvent) => {
      const newCategory = event.detail.category
      // Find which main category contains this subcategory
      for (const [mainCategory, subCategories] of Object.entries(categories)) {
        if (subCategories.some(sub => sub.name === newCategory)) {
          setSelectedMainCategory(mainCategory as MainCategory)
          setSelectedSubCategory(newCategory)
          break
        }
      }
    }

    window.addEventListener('categorySelected', handleCategoryChange as EventListener)
    return () => {
      window.removeEventListener('categorySelected', handleCategoryChange as EventListener)
    }
  }, [])

  // Add effect to set initial category based on user's primary resource
  useEffect(() => {
    if (currentUser?.primaryResource?.[0]) {
      const primaryResource = currentUser.primaryResource[0];
      
      // Find the main category that contains the primary resource
      for (const [mainCategory, subCategories] of Object.entries(categories)) {
        const subCategory = subCategories.find(sub => sub.name === primaryResource);
        if (subCategory) {
          setSelectedMainCategory(mainCategory as MainCategory);
          setSelectedSubCategory(primaryResource);
          break;
        }
      }
    }
  }, [currentUser]);

  // Filter users based on search and category filters
  const filteredUsers: Array<{ id: string; name: string }> = [] // Empty array since we removed dummy data

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleAuth = async () => {
    try {
      const result = await validateAccessToken();
      if (result.success && result.user) {
        setCurrentUser({
          id: result.user.id.toString(),
          name: result.user.name,
          email: result.user.email,
          primaryResource: result.user.primaryResource || [],
          profile_image_url: result.user.profile_image_url || undefined
        });
      }
    } catch (error) {
      console.error('Error validating token:', error);
    }
  };

  useEffect(() => {
    // Check authentication on mount
    handleAuth()
  }, [])

  useEffect(() => {
    // Wait until user is authenticated before fetching deals
    // if (!currentUser) return; 

    // Initial fetch of deals
    const fetchDeals = async () => {
      setIsLoading(true)
      setError(null)
      try {
       
        // Reverted: Always fetch sender info, requires GRANT SELECT on users to anon
        const selectQuery = ` 
            *,
            sender:users!deals_sender_id_users_id_fk (
              id,
              name,
              email,
              profile_image_url
            )
          `;

        // console.log('Using select query:', selectQuery); // Optional: keep for debugging if needed

        // Execute the query
        const { data, error } = await supabase
          .from('deals')
          .select(selectQuery)
          .order('created_at', { ascending: true })
          .limit(100)

        // --- Check for errors FIRST --- 
        if (error) {
          console.error('Supabase error details:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
          })
          // Throw the error to be caught by the catch block
          throw error;
        }

        // --- Process data only if no error --- 
      
        if (data) {
          // Original assertion can be used now as sender should always be requested
          setDeals(data as Deal[]) 
        } else {
          // Handle case where data is null/undefined even without an error
          setDeals([]); 
        }

      } catch (err: any) {
        console.error('Error in fetchDeals:', err)
        setError(`Failed to load deals: ${err.message || 'Unknown error'}`)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDeals()

    // Set up real-time subscription
    const subscription = supabase
      .channel('deals')
      .on<Deal>(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'deals'
        },
        async (payload) => {
       
          if (payload.eventType === 'INSERT' && payload.new) {
            // Fetch the sender's name for the new deal
            const { data: userData } = await supabase
              .from('users')
              .select('name')
              .eq('id', payload.new.sender_id)
              .single()
            
            const newDeal = {
              ...payload.new,
              sender: { name: userData?.name || 'Unknown User' }
            } as Deal
            
            setDeals(current => [...current, newDeal])
          } else if (payload.eventType === 'DELETE' && payload.old) {
            setDeals(current => current.filter(deal => deal.id !== payload.old!.id))
          } else if (payload.eventType === 'UPDATE' && payload.new) {
            setDeals(current => current.map(deal => 
              deal.id === payload.new!.id ? payload.new as Deal : deal
            ))
          }
        }
      )
      .subscribe()

    return () => {
    
      subscription.unsubscribe()
    }
  }, [currentUser])

  useEffect(() => {
    if (!isInitialMount.current) {
      scrollToBottom();
    }
    isInitialMount.current = false;
  }, [deals, dMMessages]);

  // Add effects for category changes
  useEffect(() => {
    scrollToBottom()
  }, [selectedMainCategory])

  useEffect(() => {
    scrollToBottom()
  }, [selectedSubCategory])

  // Add effect for DM view changes
  useEffect(() => {
    scrollToBottom()
  }, [selectedUser])

  // Add effect for view mode changes
  useEffect(() => {
    scrollToBottom()
  }, [viewMode])

  // Add effect to scroll to bottom when messages change
  useEffect(() => {
    if (dMMessages.length > 0) {
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    }
  }, [dMMessages]);

  const handleReply = async (deal: Deal) => {
    if (!currentUser) {
      navigate({ to: '/login', search: { redirect: '/' } });
      return;
    }
    
    // Reset DM state
    setDMMessages([]);
    setNewMessage('');
    
    try {
      // Fetch the deal with user details
      const { data: dealData, error: dealError } = await supabase
        .from('deals')
        .select(`
          *,
          sender:users!deals_sender_id_users_id_fk (
            id,
            name,
            email
          )
        `)
        .eq('id', deal.id)
        .single();

      if (dealError) {
        console.error('Error fetching deal:', dealError);
        throw dealError;
      }

      if (dealData) {
        // Set the selected deal and user
        setSelectedDeal(dealData);
        setSelectedUser({
          id: dealData.sender_id.toString(),
          name: dealData.sender?.name || 'Unknown User',
          email: dealData.sender?.email || '',
          primaryResource: currentUser.primaryResource
        });
        
        setViewMode('dm');
        
        // Parse the description to check if it's a reply
        let dealTitle = dealData.title;
        try {
          const descriptionObj = JSON.parse(dealData.description);
          if (descriptionObj && descriptionObj.reply_to) {
            dealTitle = `Reply to ${descriptionObj.reply_to.sender_name}: ${descriptionObj.text}`;
          }
        } catch (e) {
          // Not a reply, use original title
        }

        // Create initial system message
        const systemMessage: DMMessage = {
          id: Date.now(),
          message: `Deal: ${dealTitle}`,
          sender_id: -1, // Use -1 to indicate system message
          receiver_id: parseInt(currentUser.id),
          deal_id: parseInt(dealData.id),
          created_at: new Date(),
          is_read: true
        };

        // Load existing DMs for this specific deal only
        const { data: existingMessages, error: messagesError } = await supabase
          .from('dms')
          .select('*')
          .eq('deal_id', deal.id)  // Only get messages for this specific deal
          .or(`and(sender_id.eq.${currentUser.id},receiver_id.eq.${dealData.sender_id}),and(sender_id.eq.${dealData.sender_id},receiver_id.eq.${currentUser.id})`)
          .order('created_at');

        if (messagesError) {
          console.error('Error fetching existing DMs:', messagesError);
          throw messagesError;
        }

        // Set messages with system message first, followed by existing messages
        if (existingMessages && existingMessages.length > 0) {
          setDMMessages([systemMessage, ...existingMessages]);
        } else {
          setDMMessages([systemMessage]);
        }
      }
    } catch (error) {
      console.error('Error in handleReply:', error);
    }
  };

  const handleReplyInRoom = (deal: Deal) => {
    if (!currentUser) {
      navigate({ to: '/login', search: { redirect: '/' } });
      return;
    }
    
    // Set the replying to deal state
    setReplyingToDeal(deal);
    
    // Focus the input field
    const inputElement = document.querySelector('input[type="text"]') as HTMLInputElement;
    if (inputElement) {
      setTimeout(() => {
        inputElement.focus();
      }, 100);
    }
  };

  // Add a function to clear reply state
  const clearReply = () => {
    setReplyingToDeal(null);
  };

  const loadDMs = async () => {
    if (!currentUser || !selectedUser) {
    
      return;
    }


    try {
      let query = supabase
        .from('dms')
        .select('*')
        .or(`and(sender_id.eq.${currentUser.id},receiver_id.eq.${selectedUser.id}),and(sender_id.eq.${selectedUser.id},receiver_id.eq.${currentUser.id})`);

      // If we have a selected deal, only show messages for that deal
      if (selectedDeal?.id) {
        query = query.eq('deal_id', selectedDeal.id);
      }

      const { data: messages, error } = await query.order('created_at');

      if (error) {
        console.error('Error fetching DMs:', error);
        throw error;
      }

    
      if (messages) {
        setDMMessages(messages);
        // Mark messages as read after loading
        await markMessagesAsRead(messages);
        scrollToBottom();
      }
    } catch (error) {
      console.error('Error in loadDMs:', error);
    }
  };

  const handleSendDM = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser?.id || !currentUser?.id) return;
    
    // Create optimistic message
    const optimisticMessage: DMMessage = {
      id: Date.now(), // Temporary ID
      message: newMessage.trim(),
      sender_id: parseInt(currentUser.id),
      receiver_id: parseInt(selectedUser.id),
      deal_id: selectedDeal?.id ? parseInt(selectedDeal.id) : null,
      created_at: new Date(),
      is_read: false
    };

    // Add optimistic message to UI
    setDMMessages(prev => [...prev, optimisticMessage]);
    setNewMessage('');
    
    // Scroll after adding optimistic message
    setTimeout(scrollToBottom, 50);
    
    try {
      const dmData = {
        message: newMessage.trim(),
        sender_id: parseInt(currentUser.id),
        receiver_id: parseInt(selectedUser.id),
        deal_id: selectedDeal?.id ? parseInt(selectedDeal.id) : null,
        created_at: new Date().toISOString(),
        is_read: false
      };

      const { data, error } = await supabase
        .from('dms')
        .insert(dmData)
        .select('*')
        .single();

      if (error) {
        console.error('Error sending DM:', error);
        // Remove optimistic message on error
        setDMMessages(prev => prev.filter(msg => msg.id !== optimisticMessage.id));
        return;
      }

      // Replace optimistic message with real message
      if (data) {
        const realMessage = {
          ...data,
          created_at: new Date(data.created_at)
        } as DMMessage;
        setDMMessages(prev => prev.map(msg => 
          msg.id === optimisticMessage.id ? realMessage : msg
        ));
        scrollToBottom(); // Scroll after replacing with real message
      }
    } catch (error) {
      console.error('Error sending DM:', error);
      // Remove optimistic message on error
      setDMMessages(prev => prev.filter(msg => msg.id !== optimisticMessage.id));
    }
  };

  const markDMsAsRead = async () => {
    if (!currentUser) return

    try {
      const { error } = await supabase
        .from('dms')
        .update({ is_read: true })
        .eq('receiver_id', currentUser.id)

      if (error) throw error
    } catch (error) {
      console.error('Error marking DMs as read:', error)
    }
  }

  // Add real-time subscription for DMs
  useEffect(() => {
    if (!currentUser) return

    const subscription = supabase
      .channel('dms')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'dms',
          filter: `receiver_id=eq.${currentUser.id}`
        },
        async (payload) => {
          if (payload.eventType === 'INSERT') {
            const newMessage: DMMessage = {
              id: payload.new.id,
              message: payload.new.message,
              sender_id: payload.new.sender_id,
              receiver_id: payload.new.receiver_id,
              deal_id: payload.new.deal_id,
              created_at: new Date(payload.new.created_at),
              is_read: payload.new.is_read
            }
            setDMMessages(prev => [...prev, newMessage])
            
            // Update unread counter if the message is unread
            if (!payload.new.is_read) {
              updateUnreadDMsCount(prevCount => prevCount + 1)
            }

            // Reload DM groups to update the UI
            await loadAllDMs()
            
            scrollToBottom()
          }
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [currentUser])

  // Load DMs when user is selected
  useEffect(() => {
    if (selectedUser) {
      loadDMs()
    }
  }, [selectedUser])

  // Add function to manage DM counter in localStorage
  const updateUnreadDMsCount = (countOrUpdater: number | ((prev: number) => number)) => {
    if (typeof countOrUpdater === 'function') {
      setUnreadDMsCount(prev => {
        const newCount = countOrUpdater(prev);
        localStorage.setItem('unreadDMsCount', newCount.toString());
        return newCount;
      });
    } else {
      setUnreadDMsCount(countOrUpdater);
      localStorage.setItem('unreadDMsCount', countOrUpdater.toString());
    }
  };

  // Initialize unread count from localStorage on component mount
  useEffect(() => {
    const storedCount = localStorage.getItem('unreadDMsCount')
    if (storedCount) {
      setUnreadDMsCount(parseInt(storedCount))
    }
  }, [])

  // Update the view mode change handler
  const handleViewModeChange = (newMode: 'room' | 'dm') => {
    setViewMode(newMode);
    if (newMode === 'dm') {
      loadAllDMs();
    }
  };

  // Update the real-time subscription handler
  useEffect(() => {
    if (!currentUser) return;
    const subscription = supabase
      .channel('dm_list')
      .on<DMMessage>(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'dms',
          filter: `or(sender_id.eq.${currentUser.id},receiver_id.eq.${currentUser.id})`
        },
        async (payload) => {
          
          // For new messages, update the counter if it's unread and sent to current user
          if (payload.eventType === 'INSERT' && 
              payload.new.receiver_id === parseInt(currentUser.id) && 
              !payload.new.is_read) {
            updateUnreadDMsCount(prevCount => prevCount + 1);
          }
          
          // For updates (like marking as read), we need to reload the count from DB
          if (payload.eventType === 'UPDATE') {
            const { data, error } = await supabase
              .from('dms')
              .select('id')
              .eq('receiver_id', currentUser.id)
              .eq('is_read', false);

            if (!error && data) {
              updateUnreadDMsCount(data.length);
            }
          }
          
          // If we're in DM view, reload the full DM list
          if (viewMode === 'dm') {
            await loadAllDMs();
          }
        }
      )
      .subscribe();

    // Initial load of unread count from DB
    const loadInitialUnreadCount = async () => {
      const { data, error } = await supabase
        .from('dms')
        .select('id')
        .eq('receiver_id', currentUser.id)
        .eq('is_read', false);

      if (!error && data) {
        updateUnreadDMsCount(data.length);
      }
    };

    loadInitialUnreadCount();

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, [currentUser, viewMode]); // Only depend on currentUser and viewMode

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault()
    if (!message.trim() || !selectedSubCategory) return

    // Check authentication before sending
    const result = await validateAccessToken()
    if (!result.success || !result.user) {
      navigate({ to: '/login', search: { redirect: '/' } })
      return
    }

    // Create description that includes reply metadata
    let description = `New deal in ${selectedSubCategory}`
    
    // If replying to a deal, include reply metadata in the description
    if (replyingToDeal) {
      description = JSON.stringify({
        text: `New deal in ${selectedSubCategory}`,
        reply_to: {
          id: replyingToDeal.id,
          title: replyingToDeal.title,
          sender_name: replyingToDeal.sender?.name || 'Unknown'
        }
      })
    }

    const newDeal = {
      title: message,
      description: description,
      category: selectedSubCategory,
      status: 'active',
      sender_id: result.user.id
    }

    const { error } = await supabase
      .from('deals')
      .insert(newDeal)

    if (error) {
      console.error('Error sending deal:', error)
      setError(`Failed to send deal: ${error.message}`)
      return
    }

    setMessage('')
    setReplyingToDeal(null) // Clear the reply state after sending
  }

  const filteredDeals = deals.filter(deal => 
    selectedSubCategory ? deal.category === selectedSubCategory : true
  )

  const loadAllDMs = async () => {
    if (!currentUser) {
      return;
    }

    try {
      const { data: messages, error } = await supabase
        .from('dms')
        .select(`
          *,
          sender:users!dms_sender_id_users_id_fk (
            id,
            name
          ),
          receiver:users!dms_receiver_id_users_id_fk (
            id,
            name
          ),
          deal:deals!dms_deal_id_deals_id_fk (
            id,
            category,
            title
          )
        `)
        .or(`sender_id.eq.${currentUser.id},receiver_id.eq.${currentUser.id}`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching DMs:', error);
        throw error;
      }
      
      if (messages) {
        // Calculate total unread messages
        const totalUnread = messages.filter(
          msg => !msg.is_read && msg.receiver_id === parseInt(currentUser.id)
        ).length;
        
        // Update the unread count
        updateUnreadDMsCount(totalUnread);
        
        // Group messages by the other user AND deal
        const groups = new Map<string, DMGroup>();
        
        // First, sort messages by created_at to ensure we get the latest message for each group
        const sortedMessages = [...messages].sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        
        sortedMessages.forEach(msg => {
          const otherUserId = msg.sender_id === parseInt(currentUser.id) 
            ? msg.receiver_id.toString() 
            : msg.sender_id.toString();
          
          const otherUserName = msg.sender_id === parseInt(currentUser.id)
            ? msg.receiver?.name || 'Unknown User'
            : msg.sender?.name || 'Unknown User';
          
          // Create a unique key combining user ID and deal ID
          const groupKey = `${otherUserId}-${msg.deal_id || 'no-deal'}`;
          
          if (!groups.has(groupKey)) {
            // Calculate unread count for this group
            const groupUnreadCount = sortedMessages.filter(
              m => m.sender_id === parseInt(otherUserId) && 
                   !m.is_read && 
                   m.receiver_id === parseInt(currentUser.id) &&
                   (m.deal_id === msg.deal_id || (!m.deal_id && !msg.deal_id))
            ).length;

            groups.set(groupKey, {
              userId: otherUserId,
              userName: otherUserName || 'Unknown User',
              lastMessage: msg.message,
              lastMessageTime: new Date(msg.created_at),
              unreadCount: groupUnreadCount,
              dealId: msg.deal_id?.toString(),
              dealCategory: msg.deal?.category,
              dealTitle: msg.deal?.title
            });
          }
        });
        
        // Convert groups to array and sort by last message time
        const sortedGroups = Array.from(groups.values()).sort((a, b) => 
          b.lastMessageTime.getTime() - a.lastMessageTime.getTime()
        );
        
        setDmGroups(sortedGroups);
      }
    } catch (error) {
      console.error('Error in loadAllDMs:', error);
    }
  };

  // Update markMessagesAsRead to handle unread count
  const markMessagesAsRead = async (messages: DMMessage[]) => {
    if (!currentUser) return;

    // Filter messages that are unread and sent to the current user
    const unreadMessages = messages.filter(
      msg => !msg.is_read && msg.receiver_id === parseInt(currentUser.id)
    );

    if (unreadMessages.length === 0) return;

    try {
      // Update messages in the database
      const { error } = await supabase
        .from('dms')
        .update({ is_read: true })
        .in('id', unreadMessages.map(msg => msg.id));

      if (error) {
        console.error('Error marking messages as read:', error);
        return;
      }

      // Update local state for messages
      setDMMessages(prev => 
        prev.map(msg => 
          unreadMessages.some(unread => unread.id === msg.id)
            ? { ...msg, is_read: true }
            : msg
        )
      );

      // Update unread count
      const newUnreadCount = Math.max(0, unreadDMsCount - unreadMessages.length);
      updateUnreadDMsCount(newUnreadCount);

      // Update unread count in DM groups
      setDmGroups(prev => 
        prev.map(group => {
          // Check if this group matches the current conversation
          const isCurrentConversation = selectedUser && 
            (group.userId === selectedUser.id || 
             (group.dealId && selectedDeal?.id === group.dealId));

          if (isCurrentConversation) {
            return {
              ...group,
              unreadCount: 0
            };
          }
          return group;
        })
      );
    } catch (error) {
      console.error('Error in markMessagesAsRead:', error);
    }
  };

  // Add a scroll to message function
  const scrollToMessage = (dealId: string) => {
    // Find the message element by its ID
    const messageElement = document.getElementById(`deal-${dealId}`);
    if (messageElement) {
      // Scroll the element into view with a smooth animation
      messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      // Highlight the message briefly to help user identify it
      messageElement.classList.add('bg-blue-100');
      setTimeout(() => {
        messageElement.classList.remove('bg-blue-100');
      }, 1500);
    }
  };

  // Update the subcategory selection handler
  const handleSubCategorySelect = (subCategory: string) => {
    setSelectedSubCategory(subCategory)
    setSelectedCategory(subCategory) // Sync with CircularMenu
  }

  return (
    <div className="flex flex-col h-full relative bg-slate-50">
      {/* Main container */}
      <div className="relative flex flex-col h-full bg-white rounded-xl shadow-[0_2px_8px_-2px_rgba(0,0,0,0.1)] overflow-hidden border-2 border-slate-300">
        {/* Header with Categories */}
        <div className="sticky top-0 z-10">
          {/* Deal Room Title with Selected Categories */}
          <div className='bg-white p-2 sm:p-3 border-b-2 border-slate-300'>
            <div className="flex flex-col gap-2 mb-2 sm:mb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-4">
                  <h1 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-800 font-['Inter'] relative group">
                    Deal Room
                    <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
                  </h1>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm text-slate-500 font-medium hidden sm:block">View:</span>
                  <div className="flex bg-blue-500 rounded-lg p-0.5">
                    <button
                      onClick={() => handleViewModeChange('room')}
                      className={`
                        px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md
                        transition-all duration-200
                        ${viewMode === 'room' 
                          ? 'bg-white text-black shadow-sm' 
                          : 'text-white hover:text-slate-700'}
                      `}
                    >
                      Room
                    </button>
                    <button
                      onClick={() => handleViewModeChange('dm')}
                      className={`
                        px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md
                        transition-all duration-200 relative
                        ${viewMode === 'dm' 
                          ? 'bg-white text-black shadow-sm' 
                          : 'text-white hover:text-slate-700'}
                      `}
                    >
                      DM
                      {unreadDMsCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] sm:text-xs rounded-full w-4 h-4 flex items-center justify-center shadow-sm">
                          {unreadDMsCount}
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {viewMode === 'room' && (
              <>
                {/* Main Categories - As Tabs */}
                <div className="mb-2">
                  <div className="flex gap-1 p-0.5 bg-slate-100 rounded-lg overflow-x-auto">
                    {Object.keys(categories).map((category) => {
                      const bgColor = category === 'PROJECT & CONSTRUCTION RESOURCES' 
                        ? 'bg-blue-500' 
                        : category === 'BUSINESS RESOURCES' 
                        ? 'bg-indigo-500' 
                        : 'bg-violet-500'
                      
                      const isSelected = selectedMainCategory === category
                      
                      return (
                        <button
                          key={category}
                          onClick={() => {
                            const mainCategory = category as MainCategory
                            setSelectedMainCategory(mainCategory)
                            const firstSubCategory = categories[mainCategory]?.[0]
                            if (firstSubCategory) {
                              setSelectedSubCategory(firstSubCategory.name)
                            }
                          }}
                          className={`
                            flex-1 min-w-[120px] sm:min-w-[150px] px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md
                            transition-all duration-300 relative whitespace-nowrap
                            ${isSelected
                              ? 'text-white shadow-sm'
                              : 'text-slate-600 hover:text-slate-800 hover:bg-white'}
                          `}
                        >
                          <div className={`
                            absolute inset-0 rounded-md transition-all duration-300
                            ${isSelected ? bgColor : 'bg-transparent'}
                          `} />
                          
                          <div className="relative z-10 flex items-center justify-center">
                            <span className={`
                              ${isSelected ? 'text-white font-medium' : 'text-slate-600'}
                              truncate
                            `}>
                              {category}
                            </span>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Sub Categories Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 sm:gap-2 p-1.5 sm:p-3">
                  {categories[selectedMainCategory].map((subCategory) => {
                    const isSelected = selectedSubCategory === subCategory.name
                    const bgColor = isSelected ? 'bg-blue-500' : 'bg-white'
                    const textColor = isSelected ? 'text-white' : 'text-slate-600'
                    const hoverBg = isSelected ? 'hover:bg-blue-600' : 'hover:bg-slate-50'
                    const borderStyle = isSelected ? 'border-transparent' : 'border-slate-200'
                    const shadowStyle = isSelected ? 'shadow-[0_1px_2px_-1px_rgba(0,0,0,0.1)]' : 'shadow-[0_1px_1px_-1px_rgba(0,0,0,0.05)]'
                    
                    return (
                      <button
                        key={subCategory.name}
                        onClick={() => handleSubCategorySelect(subCategory.name)}
                        data-color={subCategory.color}
                        className={`
                          flex items-center gap-1 sm:gap-2 px-1.5 sm:px-2 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-medium
                          transition-all duration-300 group relative border
                          ${bgColor} ${textColor} ${hoverBg} ${borderStyle} ${shadowStyle}
                          ${isSelected
                            ? 'ring-1 ring-offset-1 scale-[1.01] ring-current'
                            : 'hover:scale-[1.01] hover:shadow-[0_1px_2px_-1px_rgba(0,0,0,0.1)] hover:border-slate-300'}
                        `}
                        style={{
                          '--ring-color': subCategory.color
                        } as React.CSSProperties}
                      >
                        <span className={`
                          text-sm sm:text-base transition-transform duration-300
                          ${isSelected ? 'scale-105' : 'group-hover:scale-105'}
                          drop-shadow-[0_1px_1px_rgba(0,0,0,0.1)]
                          filter brightness-110
                        `}>
                          {subCategory.icon}
                        </span>
                        <span className="truncate">{subCategory.name}</span>
                        {isSelected && (
                          <span className="ml-auto bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-full p-0.5 sm:p-1 shadow-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5 sm:h-3 sm:w-3" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Messages Area */}
        <div 
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto"
          style={{ 
            height: 'calc(100% - 120px)',
            scrollBehavior: 'smooth'
          }}
        >
          <div className=" h-full w-full">
            {viewMode === 'dm' ? (
              <div className="flex flex-col h-full">
                {!currentUser ? (
                  <div className="flex flex-col items-center justify-center h-full gap-4">
                    <div className="text-center">
                      <h3 className="text-lg font-medium text-gray-900">Please log in to access DMs</h3>
                      <p className="text-sm text-gray-500 mt-1">You need to be logged in to view and send messages</p>
                    </div>
                    <button
                      onClick={() => navigate({ to: '/login', search: { redirect: '/' } })}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Log In
                    </button>
                  </div>
                ) : !selectedUser ? (
                  <>
                    {/* DM Filtering UI */}
                    <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm p-4 border-b border-slate-200">
                      <div className="flex flex-col gap-4">
                        {/* Search Bar */}
                        <div className="relative">
                          <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search conversations..."
                            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <svg
                            className="absolute right-3 top-2.5 h-5 w-5 text-slate-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                          </svg>
                        </div>

                        {/* Category Dropdowns */}
                        <div className="grid grid-cols-2 gap-4">
                          {/* Main Category Dropdown */}
                          <div className="relative">
                            <select
                              value={selectedDMMainCategory}
                              onChange={(e) => {
                                setSelectedDMMainCategory(e.target.value as DMMainCategory);
                                setSelectedDMSubCategory(''); // Reset sub-category when main category changes
                              }}
                              className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                            >
                              <option value="ALL">All Categories</option>
                              {Object.keys(categories).map((category) => (
                                <option key={category} value={category}>{category}</option>
                              ))}
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                              <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                          </div>

                          {/* Sub-Category Dropdown */}
                          <div className="relative">
                            <select
                              value={selectedDMSubCategory}
                              onChange={(e) => setSelectedDMSubCategory(e.target.value)}
                              className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                              disabled={selectedDMMainCategory === 'ALL'}
                            >
                              <option value="">All Sub-Categories</option>
                              {selectedDMMainCategory !== 'ALL' && categories[selectedDMMainCategory]?.map((subCategory) => (
                                <option key={subCategory.name} value={subCategory.name}>{subCategory.name}</option>
                              ))}
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                              <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* DM Cards List */}
                    <div className="space-y-2 p-4">
                      {dmGroups
                        .filter(group => {
                          // Search filter - check both user name and last message
                          const searchLower = searchQuery.toLowerCase();
                          const matchesSearch = searchQuery === '' || 
                                              group.userName.toLowerCase().includes(searchLower) ||
                                              group.lastMessage.toLowerCase().includes(searchLower);
                          
                          // Category filter
                          const matchesCategory = selectedDMMainCategory === 'ALL' || 
                                                (group.dealCategory && 
                                                 Object.entries(categories).some(([mainCat, subCats]) => 
                                                   mainCat === selectedDMMainCategory &&
                                                   subCats.some(subCat => subCat.name === group.dealCategory)
                                                 ));
                          
                          // Sub-category filter
                          const matchesSubCategory = !selectedDMSubCategory || 
                                                   group.dealCategory === selectedDMSubCategory;
                          
                          return matchesSearch && matchesCategory && matchesSubCategory;
                        })
                        .map((group, index) => {
                          // Create a unique key by combining user ID, deal ID, and index
                          const uniqueKey = `${group.userId}-${group.dealId || 'no-deal'}-${index}`;
                          
                          return (
                            <div
                              key={uniqueKey}
                              onClick={async () => {
                                setIsLoadingDMs(true);
                                try {
                                  // Set the selected user
                                  setSelectedUser({
                                    id: group.userId,
                                    name: group.userName,
                                    email: '',
                                    primaryResource: currentUser?.primaryResource || []
                                  });

                                  // If there's a deal associated with this conversation, fetch its details
                                  if (group.dealId) {
                                    const { data: dealData, error: dealError } = await supabase
                                      .from('deals')
                                      .select(`
                                        *,
                                        sender:users!deals_sender_id_users_id_fk (
                                          id,
                                          name,
                                          email
                                        )
                                      `)
                                      .eq('id', group.dealId)
                                      .single();

                                    if (dealError) {
                                      console.error('Error fetching deal:', dealError);
                                      return;
                                    }

                                    if (dealData) {
                                      setSelectedDeal(dealData);
                                    }
                                  } else {
                                    setSelectedDeal(null);
                                  }

                                  // Load DMs for this specific conversation
                                  const { data: messages, error } = await supabase
                                    .from('dms')
                                    .select('*')
                                    .eq('deal_id', group.dealId || null)
                                    .or(`and(sender_id.eq.${currentUser?.id},receiver_id.eq.${group.userId}),and(sender_id.eq.${group.userId},receiver_id.eq.${currentUser?.id})`)
                                    .order('created_at');

                                  if (error) {
                                    console.error('Error fetching DMs:', error);
                                    return;
                                  }

                                  if (messages) {
                                    setDMMessages(messages);
                                  }
                                } finally {
                                  setIsLoadingDMs(false);
                                }
                              }}
                              className="bg-white rounded-lg shadow-sm p-3 cursor-pointer hover:shadow-md transition-all duration-200 border border-slate-100 relative"
                            >
                              <div className="flex items-start gap-3">
                                {/* Avatar */}
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm font-medium shadow-sm flex-shrink-0">
                                  {group.userName.charAt(0).toUpperCase()}
                                </div>
                                
                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                  {/* Header - Name and Time */}
                                  <div className="flex items-center justify-between mb-0.5">
                                    <h3 className="text-sm font-medium text-gray-900 truncate">{group.userName}</h3>
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-[10px] text-gray-400">
                                        {new Date(group.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                      </span>
                                      {group.unreadCount > 0 && (
                                        <div className="bg-blue-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center shadow-sm">
                                          {group.unreadCount}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  
                                  {/* Message Preview and Category */}
                                  <div className="flex items-center justify-between">
                                    <div className="flex-1 min-w-0 pr-2">
                                      <p className="text-xs text-gray-500 line-clamp-1">
                                        {group.lastMessage}
                                      </p>
                                      {group.dealTitle && (
                                        <p className="text-[10px] text-gray-400 mt-0.5 line-clamp-1">
                                          Deal was: {group.dealTitle}
                                        </p>
                                      )}
                                    </div>
                                    {group.dealCategory && (
                                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 whitespace-nowrap">
                                        {group.dealCategory}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </>
                ) : (
                  // Show conversation with selected user
                  <div className="flex flex-col h-full">
                    {/* Back button and user info header */}
                    <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm p-2 border-b border-slate-200">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => {
                            setSelectedUser(null);
                            setSelectedDeal(null);
                            // Fetch latest DM groups when returning to list view
                            loadAllDMs();
                          }}
                          className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-600" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white overflow-hidden">
                            {selectedUser.profile_image_url ? (
                              <img 
                                src={selectedUser.profile_image_url} 
                                alt={selectedUser.name} 
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span>{(selectedUser.name as string).charAt(0)}</span>
                            )}
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-slate-800">
                              {selectedUser.name}
                            </h3>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Deal Preview */}
                    {selectedDeal && (
                      <div className="p-4 border-b border-slate-200 bg-slate-50">
                        <div className="bg-white rounded-lg p-4 shadow-sm">
                          <h4 className="text-sm font-medium text-slate-800">
                            {(() => {
                              try {
                                const descriptionObj = JSON.parse(selectedDeal.description);
                                if (descriptionObj && descriptionObj.reply_to) {
                                  return `Reply to ${descriptionObj.reply_to.sender_name}: ${descriptionObj.text}`;
                                }
                              } catch (e) {
                                // Not a reply, use original title
                              }
                              return selectedDeal.title;
                            })()}
                          </h4>
                          <p className="text-xs text-slate-500 mt-1">
                            {(() => {
                              try {
                                const descriptionObj = JSON.parse(selectedDeal.description);
                                if (descriptionObj && descriptionObj.reply_to) {
                                  return `Original message: ${descriptionObj.reply_to.title}`;
                                }
                              } catch (e) {
                                // Not a reply, use original description
                                return selectedDeal.description;
                              }
                            })()}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-600">
                              {selectedDeal.category}
                            </span>
                            <span className="text-xs text-slate-500">
                              {new Date(selectedDeal.created_at).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Messages Container */}
                    <div className="overflow-y-auto flex-1" style={{ minHeight: "200px" }}>
                      <div className="p-4 space-y-4">
                        {isLoadingDMs ? (
                          <div className="flex items-center justify-center h-32">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                          </div>
                        ) : (
                          <>
                            {dMMessages.map((msg: DMMessage) => {
                              const isCurrentUserMessage = currentUser?.id ? msg.sender_id === parseInt(currentUser.id) : false;
                              const isSystemMessage = msg.sender_id === -1;
                              
                              // Create a unique key for each message, properly handling the date
                              const messageKey = `msg-${msg.id}-${new Date(msg.created_at).getTime()}`;
                              
                              if (isSystemMessage) {
                                return (
                                  <div key={messageKey} className="flex justify-center">
                                    <div className="bg-gray-100 text-gray-600 rounded-lg px-4 py-2 text-sm">
                                      {msg.message}
                                    </div>
                                  </div>
                                );
                              }

                              return (
                                <div key={messageKey} className={`flex ${isCurrentUserMessage ? 'justify-end' : 'justify-start'} mb-1.5`}>
                                  <div className={`max-w-[80%] rounded-2xl p-2.5 ${
                                    isCurrentUserMessage
                                      ? 'bg-[#0084ff] text-white shadow-sm' 
                                      : msg.deal_id !== null
                                        ? 'bg-[#f0f2f5] text-gray-800 border border-[#e4e6eb]'
                                        : 'bg-[#e4e6eb] text-gray-800 border border-[#e4e6eb]'
                                  }`}>
                                    <p className="text-xs leading-relaxed">{msg.message}</p>
                                    <div className="flex justify-end">
                                      <p className="text-[10px] mt-1 opacity-70">
                                        {new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )
                            })}
                            <div ref={messagesEndRef} />
                          </>
                        )}
                      </div>
                    </div>

                    {/* Input Box */}
                    <div className="bg-white border-t border-slate-200 p-4">
                      <form onSubmit={handleSendDM} className="flex gap-2">
                        <input
                          type="text"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Type a message..."
                          className="flex-1 px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          type="submit"
                          disabled={!newMessage.trim()}
                          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Send
                        </button>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // Original deals view
              isLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : error ? (
                <div className="flex items-center justify-center h-32">
                  <div className="text-red-500 text-center">
                    <p className="font-medium">{error}</p>
                    <button 
                      onClick={() => window.location.reload()}
                      className="mt-2 text-sm text-blue-500 hover:text-blue-700"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              ) : filteredDeals.length === 0 ? (
                <div className="flex items-center justify-center h-32">
                  <div className="text-gray-500 text-center">
                    <p className="font-medium">No deals found</p>
                    <p className="text-sm mt-1">Start by sending a new deal</p>
                  </div>
                </div>
              ) : (
                <>
                  {filteredDeals.map((deal) => {
                    const categoryColor = categories[selectedMainCategory]?.find(
                      cat => cat.name === deal.category
                    )?.color || '#666'

                    const isCurrentUser = currentUser?.id === deal.sender_id.toString()
                    
                    // Try to parse the description for reply metadata
                    let replyToData = null
                    try {
                      const descriptionObj = JSON.parse(deal.description)
                      if (descriptionObj && descriptionObj.reply_to) {
                        replyToData = descriptionObj.reply_to
                      }
                    } catch (e) {
                      // Not JSON or not a reply, ignore
                    }

                    return (
                      <div 
                        key={deal.id}
                        id={`deal-${deal.id}`}
                        className={`border-b border-gray-100 px-3 py-2.5 ${isCurrentUser ? 'bg-blue-50 border-gray-200' : 'hover:bg-gray-50'} transition-colors duration-200`}
                      >
                        <div className="flex gap-2.5">
                          {/* Avatar */}
                          <div className="flex-shrink-0">
                            <div 
                              onClick={() => alert(`Viewing profile of ${deal.sender?.name || 'Unknown User'}`)}
                              className={`w-8 h-8 rounded-full overflow-hidden cursor-pointer ${isCurrentUser ? 'border-2 border-[#0084ff]' : 'border border-gray-200'}`}
                            >
                              {deal.sender?.profile_image_url ? (
                                <img 
                                  src={deal.sender.profile_image_url} 
                                  alt={deal.sender.name} 
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div 
                                  className={`w-full h-full flex items-center justify-center ${isCurrentUser ? 'bg-[#0084ff]' : 'bg-gray-100'}`}
                                >
                                  <span className={`text-xs font-bold ${isCurrentUser ? 'text-white' : 'text-gray-700'}`}>
                                    {deal.sender?.name?.charAt(0).toUpperCase() || '?'}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            {/* Header: Name and time */}
                            <div className="flex items-baseline gap-1 mb-0.5">
                              <span className={`font-bold text-xs truncate mr-1 ${isCurrentUser ? 'text-[#0084ff]' : 'text-gray-900'}`}>
                                {isCurrentUser ? 'You' : deal.sender?.name || 'Unknown User'}
                              </span>
                              <span className="text-gray-500 text-[10px]">·</span>
                              <span className="text-gray-500 text-[10px]">
                                {new Date(deal.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </span>
                            </div>

                            {/* Reply info - if this is a reply */}
                            {replyToData && (
                              <div className="mb-1.5 text-gray-500 text-[10px]">
                                <span 
                                  className="flex items-center gap-1 hover:text-[#0084ff] cursor-pointer group"
                                  onClick={() => scrollToMessage(replyToData.id)}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5 group-hover:text-[#0084ff]" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                                  </svg>
                                  Replying to <span className="text-[#0084ff] underline group-hover:no-underline">{replyToData.sender_name || 'Unknown'}</span>
                                </span>
                              </div>
                            )}

                            {/* Message body */}
                            <div className={`text-xs mb-1.5 break-words leading-relaxed ${isCurrentUser ? 'text-gray-800' : 'text-gray-900'}`}>
                              {deal.title}
                            </div>

                            {/* Actions */}
                            <div className="flex mt-1">
                              {/* Reply button */}
                              <button 
                                onClick={() => handleReplyInRoom(deal)}
                                className="flex items-center text-gray-500 hover:text-[#0084ff] group mr-4"
                              >
                                <div className="p-1 rounded-full group-hover:bg-[#0084ff]/10 transition-colors">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                                  </svg>
                                </div>
                                <span className="text-[10px] ml-1">Reply</span>
                              </button>

                              {/* DM button - only show for others' messages */}
                              {!isCurrentUser && (
                                <button 
                                  onClick={() => handleReply(deal)}
                                  className="flex items-center text-gray-500 hover:text-[#0084ff] group"
                                >
                                  <div className="p-1 rounded-full group-hover:bg-[#0084ff]/10 transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                  </div>
                                  <span className="text-[10px] ml-1">DM</span>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  <div ref={messagesEndRef} />
                </>
              )
            )}
          </div>
        </div>

        {/* Room Input - Only show in room view */}
        {viewMode === 'room' && (
          <div className="sticky bottom-0 z-10 bg-white border-t border-slate-100 p-2">
            {replyingToDeal && (
              <div className="flex items-center justify-between mb-2 px-3 py-1.5 bg-blue-50 border-y border-blue-100">
                <div 
                  className="flex items-start gap-2 cursor-pointer hover:bg-blue-100 px-2 py-1 rounded-md transition-colors"
                  onClick={() => scrollToMessage(replyingToDeal.id)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-[#0084ff] mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                  </svg>
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-xs text-gray-900">
                        {replyingToDeal.sender?.name || 'Unknown'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-700 line-clamp-1">{replyingToDeal.title}</p>
                  </div>
                </div>
                <button 
                  onClick={clearReply}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            )}
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={replyingToDeal ? "Type your reply..." : "Type your deal..."}
                className="flex-1 px-3 py-2 text-xs border-none focus:outline-none focus:ring-0"
              />
              <button
                type="submit"
                disabled={!message.trim() || !selectedSubCategory}
                className="px-3 py-1.5 bg-[#0084ff] text-white text-xs rounded-full hover:bg-[#0076e6] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}