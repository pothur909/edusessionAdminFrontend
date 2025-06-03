"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import UpdateForm from "./UpdateFrom";

// Utility to style each level differently
const getLevelStyle = (level) => {
  switch (level) {
    case 0:
      return { emoji: "🏫", color: "text-indigo-700" };
    case 1:
      return { emoji: "📘", color: "text-green-700" };
    case 2:
      return { emoji: "📗", color: "text-orange-600" };
    default:
      return { emoji: "📄", color: "text-gray-700" };
  }
};

const TreeItem = ({
  label,
  children,
  level = 0,
  onDelete,
  board,
  className,
  subject,
}) => {
  const [expanded, setExpanded] = useState(false);
  const { emoji, color } = getLevelStyle(level);

  const handleDelete = (e) => {
    e.stopPropagation(); // prevent toggling expand
    if (window.confirm(`Are you sure you want to delete "${label}"?`)) {
      onDelete?.(board, className, subject);
    }
  };

  return (
    <div className="relative ml-6">
      {level > 0 && (
        <div className="absolute left-0 top-4 bottom-0 w-px bg-gray-300" />
      )}
      <div className="relative flex items-center space-x-2 mb-2">
        {level > 0 && (
          <div className="absolute left-0 top-1/2 w-6 h-px bg-gray-300 -translate-y-1/2" />
        )}
        <div
          className="flex items-center justify-between w-full pl-6 py-1 cursor-pointer hover:bg-blue-50 rounded-lg transition-all"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-blue-500 border-2 border-white shadow z-10" />
            {children && (
              <div className="text-gray-500">
                {expanded ? (
                  <ChevronDown size={18} />
                ) : (
                  <ChevronRight size={18} />
                )}
              </div>
            )}
            <span className={`font-medium ${color}`}>
              {emoji} {label}
            </span>
          </div>
          <button
            onClick={handleDelete}
            className="text-red-500 hover:text-red-700 p-1 rounded"
            title="Delete"
          >
            ❌
          </button>
        </div>
      </div>

      <div
        className={`ml-4 border-l border-gray-200 pl-4 overflow-hidden transition-all duration-300 ease-in-out ${
          expanded ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        {expanded && children}
      </div>
    </div>
  );
};

const TreeView = ({ data, onUpdate, onDelete }) => {
  return (
    <div>
      {data.map((board) => (
        <TreeItem
          key={board.board}
          label={board.board}
          level={0}
          onDelete={onDelete}
          board={board.board}
        >
          {board.classes.map((cls) => (
            <TreeItem
              key={cls.name}
              label={cls.name}
              level={1}
              onDelete={onDelete}
              board={board.board}
              className={cls.name}
            >
              {cls.subjects.map((subj) => (
                <TreeItem
                  key={subj}
                  label={subj}
                  level={2}
                  onDelete={onDelete}
                  board={board.board}
                  className={cls.name}
                  subject={subj}
                />
              ))}
            </TreeItem>
          ))}
        </TreeItem>
      ))}

      <UpdateForm onSubmit={onUpdate} />
    </div>
  );
};

export default TreeView;
