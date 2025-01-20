import React, { useRef, useState, useEffect, DragEvent } from 'react';
import { X, GripVertical } from 'lucide-react';
import { Constants } from 'librechat-data-provider';
import { TooltipAnchor } from './Tooltip';
import { useLocalize } from '~/hooks';
import { motion, AnimatePresence } from 'framer-motion';

interface AgentConversationStartersProps {
  field: {
    value: string[];
    onChange: (value: string[]) => void;
  };
  inputClass: string;
  labelClass: string;
}

export default function AgentConversationStarters({
  field,
  inputClass,
  labelClass,
}: AgentConversationStartersProps) {
  const localize = useLocalize();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(true);

  useEffect(() => {
    if (field.value.length === 0) {
      field.onChange(['']);
    }
  }, [field.value, field]);

  const handleDeleteStarter = (index: number) => {
    if (!field.value[index]) {
      return;
    }
    const newValues = field.value.filter((_, i) => i !== index);
    if (newValues.length === 0) {
      newValues.push('');
    }
    field.onChange(newValues);
  };

  const handleStarterChange = (value: string, index: number) => {
    const newValue = [...field.value];
    newValue[index] = value;
    if (
      index === field.value.length - 1 &&
      value.trim() &&
      field.value.length < Constants.MAX_CONVO_STARTERS
    ) {
      newValue.push('');
    }
    field.onChange(newValue);
  };

  const handleBlur = (index: number) => {
    if (!field.value[index] && index !== field.value.length - 1) {
      const newValues = field.value.filter((val, i) => i !== index || val.trim() !== '');
      if (newValues.length === 0) {
        newValues.push('');
      }
      field.onChange(newValues);
    }
  };

  const handleDragStart = (index: number) => (e: DragEvent<HTMLDivElement>) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));
    setDragIndex(index);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    setDragOverIndex(null);
  };

  const handleDragOver = (index: number) => (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = (index: number) => (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) {
      return;
    }
    const updated = [...field.value];
    const [removed] = updated.splice(dragIndex, 1);
    updated.splice(index, 0, removed);
    field.onChange(updated);
    setDragIndex(null);
    setDragOverIndex(null);
  };

  const getDisplayValue = (starter: string, index: number) => {
    if (dragIndex === null || dragOverIndex === null) {
      return starter;
    }
    if (index === dragOverIndex && dragIndex !== dragOverIndex) {
      return field.value[dragIndex];
    }
    if (index === dragIndex && dragIndex !== dragOverIndex) {
      return '';
    }
    return starter;
  };

  return (
    <div className="relative">
      <label className={labelClass} htmlFor="conversation_starters">
        {localize('com_agents_conversation_starters')}
      </label>
      <div className="mt-4 space-y-2">
        <AnimatePresence>
          {field.value.map((starter, index) => (
            <motion.div
              key={index}
              className={`hover:bg-accent-primary/5 group relative flex h-10 transform-gpu
                items-center rounded-lg transition-transform duration-300
                ease-in-out
                ${dragIndex === index ? 'scale-[0.98] opacity-50' : ''}
                ${dragOverIndex === index ? 'bg-accent-primary/10 shadow-sm' : ''}
                ${dragIndex !== null ? 'cursor-grabbing' : ''}`}
              draggable
              data-index={index}
              onDragStart={handleDragStart(index)}
              onDragEnd={handleDragEnd}
              onDragOver={handleDragOver(index)}
              onDrop={handleDrop(index)}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              layout
            >
              <div className="flex h-full cursor-grab items-center justify-center px-2 opacity-60 transition-opacity group-hover:opacity-100">
                <GripVertical className="size-4 text-text-secondary" />
              </div>
              <input
                ref={(el) => (inputRefs.current[index] = el)}
                value={getDisplayValue(starter, index)}
                onChange={(e) => handleStarterChange(e.target.value, index)}
                onBlur={() => handleBlur(index)}
                className={`${inputClass} relative h-full flex-1 pr-10 transition-colors`}
                type="text"
                maxLength={64}
              />
              <TooltipAnchor
                side="top"
                description={localize('com_ui_delete')}
                className="absolute bottom-[0.55rem] right-1 flex size-7 items-center justify-center rounded-lg transition-colors duration-200 hover:bg-surface-hover"
                onClick={() => handleDeleteStarter(index)}
                disabled={!starter.trim()}
              >
                <X className="size-4" />
              </TooltipAnchor>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
