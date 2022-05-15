import {
  MutationFunction,
  MutationKey,
  QueryClient,
  useIsMutating,
  useMutation,
  UseMutationOptions,
  defaultContext,
} from "react-query";
import { MutationFilters } from "react-query/lib/core/utils";
import { generateKey } from "./internal/generateKey";
import { MutationToolkit } from "./types/mutationToolkit";

export function createMutationToolkit(queryClient: QueryClient) {
  function createMutation<TMutationFnArgs, TMutationFnReturn, TContext>(
    mutationKey: MutationKey,
    mutationFn: MutationFunction<TMutationFnReturn, TMutationFnArgs>,
    defaultOptions?: UseMutationOptions<
      TMutationFnReturn,
      Error,
      TMutationFnArgs,
      TContext
    >,
  ) {
    const keyGenerator = generateKey(mutationKey);

    const hooks = {
      useMutation: (
        options?: UseMutationOptions<
          TMutationFnReturn,
          Error,
          TMutationFnArgs,
          TContext
        >,
      ) =>
        useMutation(keyGenerator(options?.mutationKey), mutationFn, {
          context: defaultContext,
          ...defaultOptions,
          ...options,
        }),
      useIsMutating: (
        filters?: MutationFilters,
        options?: UseMutationOptions<
          TMutationFnReturn,
          Error,
          TMutationFnArgs,
          TContext
        >,
      ) =>
        useIsMutating(filters || {}, {
          context: defaultContext,
          ...options,
        }),
    };

    return new Proxy(hooks, {
      get(target: any, path: keyof MutationToolkit) {
        if (target[path]) return target[path];
        switch (path) {
          case "isMutating":
            return (filters?: MutationFilters) =>
              queryClient.isMutating({
                ...filters,
                mutationKey: keyGenerator(filters?.mutationKey),
              });
          default:
            throw new Error("unknown property is given");
        }
      },
    }) as MutationToolkit<TMutationFnArgs, TMutationFnReturn>;
  }

  return createMutation;
}
