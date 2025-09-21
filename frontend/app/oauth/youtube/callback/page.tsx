import { Suspense } from 'react';
import YouTubeCallbackClient from './YouTubeCallbackClient';

export default function YouTubeCallback() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <YouTubeCallbackClient />
    </Suspense>
  );
}
