import { UseMutationOptions, UseMutationResult, MutationFilters} from "@tanstack/react-query";

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
