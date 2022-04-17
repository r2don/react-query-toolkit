import { vi } from "vitest";
import { expect, it, describe } from "vitest";

import { createMutationToolkit } from "../src/createMutationToolkit";
import { customRenderHook, mockQueryClient } from "./utils";

describe("createMutationToolkit", () => {
  const mutationToolkit = createMutationToolkit(mockQueryClient);
  const mockOnSuccess = vi.fn();
  let count = 0;
  const mockApi = (number: number) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        count += number;
        resolve(null);
      }, 50);
    });
  };
  const mockApiMutation = mutationToolkit(["mockApi"], mockApi, {
    onSuccess: mockOnSuccess,
  });

  it("should handle useMutation", async () => {
    const { result, waitFor } = customRenderHook(() =>
      mockApiMutation.useMutation(),
    );
    const res = await result.current.mutateAsync(1);
    expect(res).toBe(null);
    expect(count).toBe(1);

    result.current.mutate(2);
    await waitFor(() => result.current.isSuccess);
    expect(count).toEqual(3);
    expect(mockOnSuccess).toBeCalledTimes(2);
  });

  it("should indicate proper isMutating", async () => {
    const { result } = customRenderHook(() => mockApiMutation.useMutation());
    const { result: result1 } = customRenderHook(() =>
      mockApiMutation.useIsMutating(),
    );

    expect(mockApiMutation.isMutating()).toBe(0);
    expect(result1.current).toBe(0);

    result.current.mutateAsync(1);

    expect(mockApiMutation.isMutating()).toBe(1);
    // expect(result1.current).toBe(1); // FIXME: this test case must be true
  });
});
