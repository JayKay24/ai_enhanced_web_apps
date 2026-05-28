import { renderHook } from '@testing-library/react';
import useEnterSubmit from './use-enter-submit';

describe('useEnterSubmit', () => {
  it('should initialize with a null formRef', () => {
    const { result } = renderHook(() => useEnterSubmit());
    expect(result.current.formRef.current).toBeNull();
  });

  it('should call requestSubmit when Enter is pressed without Shift', () => {
    const { result } = renderHook(() => useEnterSubmit());
    const mockRequestSubmit = jest.fn();
    const mockPreventDefault = jest.fn();

    // Mock the formRef current element
    (result.current.formRef as any).current = {
      requestSubmit: mockRequestSubmit,
    };

    const event = {
      key: 'Enter',
      shiftKey: false,
      nativeEvent: { isComposing: false },
      preventDefault: mockPreventDefault,
    } as any;

    result.current.onKeyDown(event);

    expect(mockRequestSubmit).toHaveBeenCalledTimes(1);
    expect(mockPreventDefault).toHaveBeenCalledTimes(1);
  });

  it('should not call requestSubmit when Shift+Enter is pressed', () => {
    const { result } = renderHook(() => useEnterSubmit());
    const mockRequestSubmit = jest.fn();
    const mockPreventDefault = jest.fn();

    (result.current.formRef as any).current = {
      requestSubmit: mockRequestSubmit,
    };

    const event = {
      key: 'Enter',
      shiftKey: true,
      nativeEvent: { isComposing: false },
      preventDefault: mockPreventDefault,
    } as any;

    result.current.onKeyDown(event);

    expect(mockRequestSubmit).not.toHaveBeenCalled();
    expect(mockPreventDefault).not.toHaveBeenCalled();
  });
});
