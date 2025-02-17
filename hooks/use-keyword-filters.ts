import { useState, useCallback } from "react";
import { ComponentKeywordFilter } from "@/types/filters";

export function useKeywordFilters(
  initialKeywords: ComponentKeywordFilter[] = []
) {
  const [keywords, setKeywords] = useState<ComponentKeywordFilter[]>(
    initialKeywords.length ? initialKeywords : []
  );

  const addKeyword = useCallback(
    (term: string, matchExact: boolean) => {
      const trimmedTerm = term.trim();
      if (!trimmedTerm) return false;

      // Check for duplicates
      const isDuplicate = keywords.some(
        (k) =>
          k.term.toLowerCase() === trimmedTerm.toLowerCase() &&
          k.matchExact === matchExact
      );

      if (isDuplicate) return false;

      setKeywords((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          term: trimmedTerm,
          matchExact,
        },
      ]);
      return true;
    },
    [keywords]
  );

  const removeKeyword = useCallback((id: string) => {
    setKeywords((prev) => prev.filter((k) => k.id !== id));
  }, []);

  const updateKeyword = useCallback(
    (id: string, updates: Partial<ComponentKeywordFilter>) => {
      setKeywords((prev) =>
        prev.map((k) => (k.id === id ? { ...k, ...updates } : k))
      );
    },
    []
  );

  return {
    keywords,
    addKeyword,
    removeKeyword,
    updateKeyword,
    setKeywords,
  };
}
