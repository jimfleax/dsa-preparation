import { Track } from "../types";
import { extractTitleSlug } from "./slugUtils";

/**
 * Validates the active track and part from localStorage against current progress.
 * If the active part or track is completed, it clears them from localStorage and returns nulls.
 * 
 * @param tracks The list of current tracks.
 * @param trackedProblems A set of solved problem slugs.
 * @returns The verified activeTrackId and activePartIndex.
 */
export function getVerifiedActiveTrackData(
  tracks: Track[],
  trackedProblems: Set<string>
): { activeTrackId: string | null; activePartIndex: number | null } {
  const currentActiveId = localStorage.getItem("activeTrackId");
  const currentActivePartIndexStr = localStorage.getItem("activePartIndex");
  
  let activeTrackId = currentActiveId;
  let activePartIndex = currentActivePartIndexStr ? parseInt(currentActivePartIndexStr) : null;

  if (activeTrackId) {
    const activeTrack = tracks.find((t) => t._id === activeTrackId);
    
    if (activeTrack) {
      // 1. Check if the active part (subtrack) is completed
      if (activePartIndex !== null && activeTrack.parts && activeTrack.parts[activePartIndex]) {
        const activePart = activeTrack.parts[activePartIndex];
        
        const isPartCompleted = 
          activePart.problems.length > 0 && 
          activePart.problems.every((p) => {
            const slug = extractTitleSlug(p.url);
            return slug && trackedProblems.has(slug);
          });

        if (isPartCompleted) {
          activePartIndex = null;
          localStorage.removeItem("activePartIndex");
        }
      }

      // 2. Check if the entire track is completed
      const allProblems = [
        ...(activeTrack.problems || []),
        ...(activeTrack.parts?.flatMap((p) => p.problems) || []),
      ];
      
      const allSolved =
        allProblems.length > 0 &&
        allProblems.every((p) => {
          const slug = extractTitleSlug(p.url);
          return slug && trackedProblems.has(slug);
        });

      if (allSolved) {
        activeTrackId = null;
        activePartIndex = null;
        localStorage.removeItem("activeTrackId");
        localStorage.removeItem("activePartIndex");

        // 3. Fallback: Find the next incomplete track and set it as active
        const nextIncompleteTrack = tracks.find((t) => {
          const tProblems = [
            ...(t.problems || []),
            ...(t.parts?.flatMap((p) => p.problems) || []),
          ];
          if (tProblems.length === 0) return false;
          
          return !tProblems.every((p) => {
            const slug = extractTitleSlug(p.url);
            return slug && trackedProblems.has(slug);
          });
        });

        if (nextIncompleteTrack) {
          activeTrackId = nextIncompleteTrack._id;
          localStorage.setItem("activeTrackId", activeTrackId);
        }
      }
    }
  }

  return { activeTrackId, activePartIndex };
}
