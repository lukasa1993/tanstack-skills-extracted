// Repository example (MIT). Requires a QueryClientProvider above the component.
import { useMutation, useQueryClient } from '@tanstack/react-query'

export type Todo = { id: number; title: string }
export const todosKey = ['todos'] as const

// This list has one active rename at a time. The consumer must disable further
// edits while isPending; whole-list snapshots cannot safely roll back overlapping
// mutations. On success or failure, wait for reconciliation before allowing more.
export function useRenameTodo(save: (todo: Todo) => Promise<Todo>) {
  const client = useQueryClient()
  return useMutation({
    mutationFn: save,
    onMutate: async (todo) => {
      await client.cancelQueries({ queryKey: todosKey, exact: true })
      const previous = client.getQueryData<Todo[]>(todosKey)
      // Do not invent a partial list when there is no cached server response.
      if (previous) {
        client.setQueryData<Todo[]>(todosKey, previous.map((item) => item.id === todo.id ? todo : item))
      }
      return { previous }
    },
    onError: (_error, _todo, context) => {
      if (context?.previous) client.setQueryData(todosKey, context.previous)
    },
    onSettled: () => client.invalidateQueries({ queryKey: todosKey, exact: true }),
  })
}
