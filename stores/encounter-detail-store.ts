import { create } from 'zustand'
import { EncounterDetail, fetchEncounterById } from '@/lib/api/encounters'

interface EncounterDetailState {
  encounters: Record<number, EncounterDetail>
  loadingIds: Set<number>
  errorById: Record<number, string | null>
  fetchEncounter: (id: number, forceRefresh?: boolean) => Promise<void>
  clear: () => void
}

export const useEncounterDetailStore = create<EncounterDetailState>((set, get) => ({
  encounters: {},
  loadingIds: new Set<number>(),
  errorById: {},

  fetchEncounter: async (id: number, forceRefresh = false) => {
    const { encounters, loadingIds } = get()

    if (!forceRefresh && encounters[id]) {
      return
    }

    if (loadingIds.has(id)) {
      return
    }

    set((state) => ({
      loadingIds: new Set(state.loadingIds).add(id),
      errorById: { ...state.errorById, [id]: null }
    }))

    try {
      const data = await fetchEncounterById(id)
      set((state) => {
        const updatedLoading = new Set(state.loadingIds)
        updatedLoading.delete(id)
        return {
          encounters: { ...state.encounters, [id]: data },
          loadingIds: updatedLoading,
          errorById: { ...state.errorById, [id]: null }
        }
      })
    } catch (error: any) {
      set((state) => {
        const updatedLoading = new Set(state.loadingIds)
        updatedLoading.delete(id)
        return {
          loadingIds: updatedLoading,
          errorById: { ...state.errorById, [id]: error.message || 'Failed to load encounter' }
        }
      })
    }
  },

  clear: () => {
    set({
      encounters: {},
      loadingIds: new Set<number>(),
      errorById: {}
    })
  }
}))


