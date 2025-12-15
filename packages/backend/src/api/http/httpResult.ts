import type { Response } from 'express';
import type { Result } from '../../shared/Result';

export function sendResult<T>(
  res: Response,
  result: Result<T, Error>,
  successStatus = 200,
  notFoundStatus = 404
): void {
  if (result.success) {
    res.status(successStatus).json({
      success: true,
      ...(typeof result.data === 'object' ? result.data : { data: result.data })
    });
    return;
  }

  const message = result.error.message ?? 'Unexpected error';

  if (message === 'Conversation not found') {
    res.status(notFoundStatus).json({ success: false, error: message });
    return;
  }

  res.status(400).json({ success: false, error: message });
}


