import { UseMutationOptions, UseMutationResult } from "react-query";
import { MutationFilters } from "react-query/lib/core/utils";

export interface MutationToolkit<
  TQueryFnArgs = void,
  TQueryFnData = unknown,
  TError = unknown,
  TData = TQueryFnData,
> {
  isMutating(filters?: MutationFilters): number;
  useMutation<TContext = unknown>(
    options?: Omit<
      UseMutationOptions<TData, TError, TQueryFnArgs, TContext>,
      "mutationKey" | "mutationFn"
    >,
  ): UseMutationResult<TData, TError, TQueryFnArgs, TContext>;
  useIsMutating(filters?: MutationFilters): number;
}
