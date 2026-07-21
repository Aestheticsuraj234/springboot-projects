import { create } from "zustand";

type PhotoSelectionState = {
  isSelectMode: boolean;
  selectedIds: string[];
  enterSelectMode: () => void;
  exitSelectMode: () => void;
  togglePhoto: (photoId: string) => void;
  selectAll: (photoIds: string[]) => void;
  clearSelection: () => void;
};

export const usePhotoSelectionStore = create<PhotoSelectionState>((set, get) => ({
  isSelectMode: false,
  selectedIds: [],
  enterSelectMode: () => set({ isSelectMode: true }),
  exitSelectMode: () => set({ isSelectMode: false, selectedIds: [] }),
  togglePhoto: (photoId) => {
    const { selectedIds } = get();
    if (selectedIds.includes(photoId)) {
      set({ selectedIds: selectedIds.filter((id) => id !== photoId) });
      return;
    }
    set({ selectedIds: [...selectedIds, photoId] });
  },
  selectAll: (photoIds) => set({ selectedIds: photoIds }),
  clearSelection: () => set({ selectedIds: [] }),
}));
