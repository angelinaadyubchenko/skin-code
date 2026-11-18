import { applyDecorators, Header } from '@nestjs/common';

export const CacheControl = (directive: string) =>
  applyDecorators(Header('Cache-Control', directive));
