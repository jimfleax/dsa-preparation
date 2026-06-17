import { useState, useMemo, useCallback } from "react";
import { DocumentMetadata } from "../types";
import { apiFetch } from "../lib/apiFetch";

export function useDocuments(apiBase: string) {
  const [documents, setDocuments] = useState<DocumentMetadata[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "success">("idle");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const fetchDocumentsList = async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) {
      setRefreshing(true);
      setSyncStatus("syncing");
    } else {
      setLoading(true);
    }

    try {
      const response = await apiFetch(`${apiBase}/api/documents`);
      const data = await response.json();
      if (data.success) {
        setDocuments(data.documents);
        if (showRefreshIndicator) {
          setSyncStatus("success");
          setTimeout(() => setSyncStatus("idle"), 2000);
        }
      } else {
        if (showRefreshIndicator) setSyncStatus("idle");
      }
    } catch (err) {
      console.error("Error loading listed documents:", err);
      if (showRefreshIndicator) setSyncStatus("idle");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const allTags = useMemo(() => {
    const tagsSet = new Set<string>();
    documents.forEach((doc) => {
      doc.tags.forEach((tag) => tagsSet.add(tag));
    });
    return Array.from(tagsSet).sort();
  }, [documents]);

  const handleToggleTag = useCallback((tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }, []);

  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase().trim();
        const matchesTitle = doc.title.toLowerCase().includes(query);
        const matchesTags = doc.tags.some((tag) =>
          tag.toLowerCase().includes(query)
        );
        if (!matchesTitle && !matchesTags) return false;
      }

      if (selectedTags.length > 0) {
        const hasSomeTags = selectedTags.some((t) => doc.tags.includes(t));
        if (!hasSomeTags) return false;
      }

      return true;
    });
  }, [documents, searchQuery, selectedTags]);

  const handleClearFilters = useCallback(() => {
    setSearchQuery("");
    setSelectedTags([]);
  }, []);

  const displayTags = useMemo(() => {
    return [...allTags].sort((a, b) => {
      const aSelected = selectedTags.includes(a);
      const bSelected = selectedTags.includes(b);
      if (aSelected && !bSelected) return -1;
      if (!aSelected && bSelected) return 1;
      return 0;
    });
  }, [allTags, selectedTags]);

  return {
    documents,
    searchQuery,
    setSearchQuery,
    loading,
    refreshing,
    syncStatus,
    selectedTags,
    setSelectedTags,
    allTags,
    displayTags,
    filteredDocuments,
    fetchDocumentsList,
    handleToggleTag,
    handleClearFilters,
  };
}
