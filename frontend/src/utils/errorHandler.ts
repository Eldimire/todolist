const ERROR_MESSAGES: Record<string, string> = {
  UNAUTHORIZED: '로그인이 필요합니다.',
  FORBIDDEN: '접근 권한이 없습니다.',
  EMAIL_ALREADY_EXISTS: '이미 사용 중인 이메일입니다.',
  INVALID_CREDENTIALS: '이메일 또는 비밀번호가 올바르지 않습니다.',
  CATEGORY_NOT_FOUND: '카테고리를 찾을 수 없습니다.',
  DEFAULT_CATEGORY_NOT_MODIFIABLE: '기본 카테고리는 수정할 수 없습니다.',
  DEFAULT_CATEGORY_NOT_DELETABLE: '기본 카테고리는 삭제할 수 없습니다.',
  TODO_NOT_FOUND: '할일을 찾을 수 없습니다.',
  INVALID_DATE_RANGE: '종료일은 시작일보다 이전일 수 없습니다.',
  NOT_FOUND: '요청한 리소스를 찾을 수 없습니다.',
  VALIDATION_ERROR: '입력값을 확인해주세요.',
  INTERNAL_SERVER_ERROR: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
};

export function getErrorMessage(code: string): string {
  return ERROR_MESSAGES[code] ?? '알 수 없는 오류가 발생했습니다.';
}

export function parseApiError(error: unknown): { code: string; message: string } {
  if (
    error &&
    typeof error === 'object' &&
    'response' in error &&
    error.response &&
    typeof error.response === 'object' &&
    'data' in error.response
  ) {
    const data = (error.response as { data: unknown }).data;
    if (data && typeof data === 'object' && 'code' in data && 'message' in data) {
      return data as { code: string; message: string };
    }
  }
  return { code: 'INTERNAL_SERVER_ERROR', message: '서버 오류가 발생했습니다.' };
}
