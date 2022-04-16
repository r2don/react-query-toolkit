import { QueryKey } from "react-query";

export const generateKey =
  (baseQueryKey: QueryKey) =>
  (queryKey?: QueryKey): QueryKey => {
    return [...baseQueryKey, ...(queryKey || [])];
  };
