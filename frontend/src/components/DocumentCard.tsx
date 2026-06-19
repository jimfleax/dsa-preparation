import { BookOpen, MapPin, Terminal, ChevronRight } from "lucide-react";
import { DocumentMetadata } from "../types";

interface DocumentCardProps {
  doc: DocumentMetadata;
  isActive: boolean;
  onSelect: () => void;
}

export default function DocumentCard({
  doc,
  isActive,
  onSelect,
}: DocumentCardProps) {
  return (
    <button
      id={`doc-card-${doc.id}`}
      onClick={onSelect}
      className={`text-left w-full p-5 rounded-2xl border transition-all duration-250 cursor-pointer flex flex-col justify-between h-full bg-white group hover:shadow-md hover:border-indigo-200 ${
        isActive
          ? "border-indigo-600 bg-indigo-50/20 ring-1 ring-indigo-500 shadow-xs"
          : "border-neutral-100 shadow-2xs"
      }`}
    >
      <div id={`doc-card-top-${doc.id}`} className="space-y-3 w-full">
        {/* Title */}
        <div id={`doc-card-title-sec-${doc.id}`} className="flex items-start gap-3">
          <div className={`p-2 rounded-lg shrink-0 transition-colors ${
            isActive ? "bg-indigo-100 text-indigo-700" : "bg-neutral-50 text-neutral-500 group-hover:bg-indigo-50 group-hover:text-indigo-600"
          }`}>
            <BookOpen className="w-4 h-4" />
          </div>
          <h3
            id={`doc-card-title-${doc.id}`}
            className={`text-base font-bold leading-snug group-hover:text-indigo-600 line-clamp-2 transition-colors ${
              isActive ? "text-indigo-900" : "text-neutral-800"
            }`}
          >
            {doc.title}
          </h3>
        </div>
      </div>

      <div
        id={`doc-card-bottom-${doc.id}`}
        className="mt-4 pt-4 border-t border-neutral-50 flex items-center justify-between w-full"
      >
        {/* Dynamic Tags */}
        <div
          id={`doc-card-tags-${doc.id}`}
          className="flex flex-wrap gap-1 max-w-[80%]"
        >
          {doc.tags.slice(0, 2).map((tag, i) => (
            <span
              key={`${doc.id}-tag-${i}`}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                isActive
                  ? "bg-indigo-100/55 text-indigo-700"
                  : "bg-neutral-50 text-neutral-500"
              }`}
            >
              {tag}
            </span>
          ))}
          {doc.tags.length > 2 && (
            <span
              id={`doc-card-count-${doc.id}`}
              className="px-1.5 py-0.5 bg-neutral-50 text-neutral-400 rounded text-[10px] font-medium"
            >
              +{doc.tags.length - 2}
            </span>
          )}
        </div>

        <ChevronRight
          id={`doc-card-chevron-${doc.id}`}
          className={`w-4 h-4 transition-transform duration-200 ${
            isActive
              ? "text-indigo-600 translate-x-0.5"
              : "text-neutral-300 group-hover:translate-x-0.5 group-hover:text-indigo-500"
          }`}
        />
      </div>
    </button>
  );
}
