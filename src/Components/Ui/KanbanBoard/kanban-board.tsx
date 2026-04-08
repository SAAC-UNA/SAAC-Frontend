import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from './card';
import { Badge } from './badge';
import { Avatar, AvatarFallback, AvatarImage } from './avatar';
import { SystemIcons } from '@/Components/Ui/Icons/SystemIcons';
import { TYPOGRAPHY } from '@/Constants/Typography';
import { ICON_SIZES } from '@/Constants/Components';
import { BADGE_COLORS } from '@/Constants/StatusBadges';
import { ITEM_VARIANTS } from '@/Constants/Animations';
import { formatDateCompact } from '@/Utils/DateUtils';

interface Task {
  id: string;
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  assignee?: {
    name: string;
    avatar: string;
  };
  tags?: string[];
  dueDate?: string;
  attachments?: number;
  comments?: number;
}

interface Column {
  id: string;
  title: string;
  tasks: Task[];
  dotClass: string;
}

const sampleData: Column[] = [];

export default function KanbanBoard() {
  const [columns, setColumns] = useState<Column[]>(sampleData);

  const handleDragStart = (e: React.DragEvent, task: Task, columnId: string) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ task, sourceColumnId: columnId }));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetColumnId: string) => {
    e.preventDefault();
    const rawData = e.dataTransfer.getData('text/plain');
    let parsed: { task: Task; sourceColumnId: string };
    try {
      parsed = JSON.parse(rawData) as { task: Task; sourceColumnId: string };
    } catch {
      return;
    }
    const { task, sourceColumnId } = parsed;
    if (sourceColumnId === targetColumnId) return;

    setColumns((prev) =>
      prev.map((col) => {
        if (col.id === sourceColumnId) {
          return { ...col, tasks: col.tasks.filter((t) => t.id !== task.id) };
        }
        if (col.id === targetColumnId) {
          return { ...col, tasks: [...col.tasks, task] };
        }
        return col;
      }),
    );
  };

  return (
    <div>
      <div className="mb-8 text-center">
        <h1 className={`${TYPOGRAPHY.pageTitle} font-semibold text-gris-una-4 mb-1`}>
          Kanban Board
        </h1>
        <p className={`${TYPOGRAPHY.pageSubtitle} text-gris-una-3`}>
          Drag and drop task management
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {columns.map((column) => (
          <div
            key={column.id}
            className="bg-blanco-una-2 rounded-corner-lg p-5 border border-gris-light"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className={`size-icon-sm rounded-corner-full ${column.dotClass}`} />
                <h3 className={`font-semibold text-gris-una-4 ${TYPOGRAPHY.body}`}>
                  {column.title}
                </h3>
                <Badge className={`${BADGE_COLORS.gris.colorClasses} ${TYPOGRAPHY.badge} border-transparent`}>
                  {column.tasks.length}
                </Badge>
              </div>
              <button className="p-1 rounded-corner-full bg-blanco-una hover:bg-gris-light transition-colors">
                <SystemIcons.actions.add className={`${ICON_SIZES.sm} text-gris-una-3`} />
              </button>
            </div>

            <div className="space-y-4">
              <AnimatePresence initial={false}>
                {column.tasks.map((task, i) => (
                  <motion.div
                    key={task.id}
                    custom={i}
                    variants={ITEM_VARIANTS}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    layout
                  >
                    <Card
                      className="cursor-move bg-blanco-una border-gris-light hover:shadow-sm transition-shadow"
                      draggable
                      onDragStart={(e) => handleDragStart(e, task, column.id)}
                    >
                      <CardContent className="p-5">
                        <div className="space-y-4">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className={`font-semibold text-gris-una-4 leading-tight ${TYPOGRAPHY.body}`}>
                              {task.title}
                            </h4>
                            <SystemIcons.interface.gripVertical className={`${ICON_SIZES.md} text-gris-una shrink-0 cursor-move`} />
                          </div>

                          {task.description && (
                            <p className={`${TYPOGRAPHY.body} text-gris-una-3 leading-relaxed`}>
                              {task.description}
                            </p>
                          )}

                          {task.tags && (
                            <div className="flex flex-wrap gap-2">
                              {task.tags.map((tag) => (
                                <Badge
                                  key={tag}
                                  className={`${BADGE_COLORS.gris.colorClasses} ${TYPOGRAPHY.badge} border-transparent`}
                                >
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}

                          <div className="flex items-center justify-between pt-2 border-t border-gris-light">
                            <div className="flex items-center gap-4 text-gris-una-2">
                              {task.dueDate && (
                                <div className="flex items-center gap-1">
                                  <SystemIcons.interface.calendar className={ICON_SIZES.sm} />
                                  <span className={`${TYPOGRAPHY.badge} font-medium`}>
                                    {formatDateCompact(task.dueDate)}
                                  </span>
                                </div>
                              )}
                              {task.comments != null && (
                                <div className="flex items-center gap-1">
                                  <SystemIcons.actions.comment className={ICON_SIZES.sm} />
                                  <span className={`${TYPOGRAPHY.badge} font-medium`}>{task.comments}</span>
                                </div>
                              )}
                              {task.attachments != null && (
                                <div className="flex items-center gap-1">
                                  <SystemIcons.interface.paperclip className={ICON_SIZES.sm} />
                                  <span className={`${TYPOGRAPHY.badge} font-medium`}>{task.attachments}</span>
                                </div>
                              )}
                            </div>

                            {task.assignee && (
                              <Avatar className="w-8 h-8 ring-2 ring-gris-light shrink-0">
                                <AvatarImage src={task.assignee.avatar} alt={task.assignee.name} />
                                <AvatarFallback className={`bg-blanco-una-2 text-gris-una-3 font-medium ${TYPOGRAPHY.badge}`}>
                                  {task.assignee.name
                                    .split(' ')
                                    .map((n) => n[0])
                                    .join('')}
                                </AvatarFallback>
                              </Avatar>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
