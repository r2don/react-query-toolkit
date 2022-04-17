import { MutationKey, QueryKey } from "react-query";

export function generateKey(baseKey: QueryKey): (key?: QueryKey) => QueryKey;
export function generateKey(
  baseKey: MutationKey,
): (key?: MutationKey) => MutationKey;
export function generateKey(baseQueryKey: QueryKey | MutationKey) {
  return (queryKey?: QueryKey | MutationKey): QueryKey | MutationKey => {
    return [...baseQueryKey, ...(queryKey || [])];
  };
}
