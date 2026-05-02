'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, MoreVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Message {
  id: string;
  sender: string;
  content: string;
  time: string;
  avatar?: string;
}

const mockMessages: Message[] = [
  { id: '1', sender: 'Fatimah Ali', content: 'Terima kasih atas bantuan makanan yang disalurkan semalam.', time: '2m lepas' },
  { id: '2', sender: 'Ahmad Zaki', content: 'Saya ingin bertanya status permohonan bantuan sewa rumah.', time: '1j lepas' },
  { id: '3', sender: 'Siti Sarah', content: 'Borang verifikasi telah saya emel pagi tadi.', time: '3j lepas' },
];

export function QuickMessages({ className }: { className?: string }) {
  return (
    <motion.div
      className={cn(
        "glass p-6 flex flex-col gap-4 min-w-[300px]",
        className
      )}
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-primary" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Mesej Terkini
          </span>
        </div>
        <button className="text-muted-foreground/40 hover:text-foreground transition-colors">
          <MoreVertical className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-4">
        {mockMessages.map((msg) => (
          <div key={msg.id} className="flex gap-3 group cursor-pointer">
            <Avatar className="h-8 w-8 border border-white/10">
              <AvatarImage src={msg.avatar} />
              <AvatarFallback className="text-[10px] bg-primary/10 text-primary">{msg.sender[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-bold text-foreground group-hover:text-primary transition-colors">
                  {msg.sender}
                </span>
                <span className="text-[9px] text-muted-foreground/60 font-medium">
                  {msg.time}
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground line-clamp-1 leading-relaxed">
                {msg.content}
              </p>
            </div>
          </div>
        ))}
      </div>

      <button className="text-[10px] font-bold text-primary hover:underline uppercase tracking-tighter mt-2 text-center">
        Lihat Semua Mesej
      </button>
    </motion.div>
  );
}
