// Compass - hosted at /compass, NOT linked from the homepage or navbar, and
// robots-noindex. Gated behind Google onboarding: unauthenticated visitors see
// the sign-in screen; signed-in users get the app with their account attached.
import { auth } from '../../auth';
import ClientApp from './_lib/ClientApp';
import Onboarding from './_lib/Onboarding';

export const metadata = {
  title: 'Compass',
  robots: { index: false, follow: false },
};

export default async function CompassPage() {
  const session = await auth();
  if (!session?.user?.id) return <Onboarding />;
  return <ClientApp userId={session.user.id} email={session.user.email ?? ''} name={session.user.name ?? ''} />;
}
