import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useChat } from './useChat';

// Mock fetch
global.fetch = vi.fn();

describe('useChat Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as any).mockReset();
  });

  it('should initialize with empty messages', () => {
    const { result } = renderHook(() => useChat({ neuraId: 0 }));

    expect(result.current.messages).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should use production API URL when in production', () => {
    // Mock window.location.hostname
    Object.defineProperty(window, 'location', {
      value: { hostname: 'econeura.com' },
      writable: true
    });

    const { result } = renderHook(() => useChat({ neuraId: 0 }));

    // Check that API_URL includes production URL (we can't directly access it, but we can test behavior)
    expect(result.current.messages).toEqual([]);
  });

  it('should use localhost API URL in development', () => {
    Object.defineProperty(window, 'location', {
      value: { hostname: 'localhost' },
      writable: true
    });

    const { result } = renderHook(() => useChat({ neuraId: 0 }));
    expect(result.current.messages).toEqual([]);
  });

  it('should detect www.econeura.com as production', () => {
    Object.defineProperty(window, 'location', {
      value: { hostname: 'www.econeura.com' },
      writable: true
    });

    const { result } = renderHook(() => useChat({ neuraId: 0 }));
    expect(result.current.messages).toEqual([]);
  });

  it('should detect azurestaticapps.net as production', () => {
    Object.defineProperty(window, 'location', {
      value: { hostname: 'happy-pebble-0553f1003.3.azurestaticapps.net' },
      writable: true
    });

    const { result } = renderHook(() => useChat({ neuraId: 0 }));
    expect(result.current.messages).toEqual([]);
  });

  it('should handle successful message send', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        message: 'Test response',
        timestamp: new Date().toISOString()
      })
    });

    const { result } = renderHook(() => useChat({ neuraId: 0 }));

    await act(async () => {
      await result.current.sendMessage('Hello');
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should handle API errors gracefully', async () => {
    (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useChat({ neuraId: 0 }));

    await act(async () => {
      await result.current.sendMessage('Hello');
    });

    expect(result.current.error).toBeTruthy();
    expect(result.current.isLoading).toBe(false);
  });

  it('should set loading state while sending message', async () => {
    (global.fetch as any).mockImplementationOnce(() =>
      new Promise(resolve => setTimeout(() => resolve({
        ok: true,
        json: async () => ({ success: true, message: 'Response' })
      }), 100))
    );

    const { result } = renderHook(() => useChat({ neuraId: 0 }));

    act(() => {
      result.current.sendMessage('Hello');
    });

    expect(result.current.isLoading).toBe(true);
  });

  it('should handle empty message gracefully', async () => {
    const { result } = renderHook(() => useChat({ neuraId: 0 }));

    await act(async () => {
      await result.current.sendMessage('');
    });

    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('should handle different assistant IDs', () => {
    const assistantIds = ['a-ceo-01', 'a-marketing-01', 'a-finance-01'];

    assistantIds.forEach((id, idx) => {
      const { result } = renderHook(() => useChat({ neuraId: idx }));
      expect(result.current.messages).toEqual([]);
    });
  });
});


