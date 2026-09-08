// Repository example (MIT). Call inside setup() with VueQueryPlugin installed.
import { useQuery } from '@tanstack/vue-query'
import { toValue, type MaybeRefOrGetter } from 'vue'

export type User = { id: string; name: string }

export function useUser(
  userId: MaybeRefOrGetter<string>,
  enabled: MaybeRefOrGetter<boolean>,
  load: (id: string, signal: AbortSignal) => Promise<User>,
) {
  return useQuery({
    // Keep the ref/getter in the key so input changes can select a new query.
    queryKey: ['user', userId],
    enabled,
    queryFn: ({ signal }) => load(toValue(userId), signal),
  })
}
