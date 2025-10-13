import ForexCalendar from './components/ForexCalendar';
import { WhopIframeSdkProvider } from '@whop/react';

export default function Page() {
  return (
    <WhopIframeSdkProvider>
      <ForexCalendar />
    </WhopIframeSdkProvider>
  );
}