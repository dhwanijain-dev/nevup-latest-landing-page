// Auth.js route handlers (Google sign-in / callback / signout). Node runtime
// because the sign-in callback writes to Postgres via `pg`.
import { handlers } from '../../../../auth';

export const runtime = 'nodejs';
export const { GET, POST } = handlers;
