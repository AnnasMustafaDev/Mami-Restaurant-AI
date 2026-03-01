import { useState, useCallback, useRef } from 'react';
import { createChatSession, sendChatMessage } from '../services/api';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  source?: 'voice' | 'text';
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        "Buonasera! I'm Sofia, your virtual host at MaMi's Food & Wine. How can I help you today? I can show you our menu, recommend wine pairings, or help you reserve a table.",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const sessionIdRef = useRef<string | null>(null);

  const ensureSession = useCallback(async (source: string = 'text'): Promise<string> => {
    if (sessionIdRef.current) return sessionIdRef.current;
    const session = await createChatSession(source);
    sessionIdRef.current = session.id;
    return session.id;
  }, []);

  const addMessage = useCallback((msg: ChatMessage) => {
    setMessages((prev) => [...prev, msg]);
  }, []);

  const sendMessage = useCallback(
    async (content: string) => {
      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content,
      };
      setMessages((prev) => [...prev, userMsg]);
      setIsLoading(true);

      try {
        const sid = await ensureSession('text');
        const response = await sendChatMessage(sid, content);
        const assistantMsg: ChatMessage = {
          id: `assistant-${response.id}`,
          role: 'assistant',
          content: response.content,
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: `error-${Date.now()}`,
            role: 'assistant',
            content: "I'm sorry, I'm having trouble right now. Please try again or call us at +1 (212) 555-MAMI.",
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [ensureSession]
  );

  return { messages, sendMessage, isLoading, ensureSession, addMessage };
}
