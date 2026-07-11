// Compass — hosted at /compass, deliberately NOT linked from the homepage
// or navbar. Reachable only by direct URL. Renders the Compass web app
// (hash-routed internally: #/, #/explorer, #/insights), client-only.
import ClientApp from './_lib/ClientApp';

export const metadata = {
  title: 'Compass — trading behavior, analyzed',
  robots: { index: false, follow: false }, // keep it out of search too
};

export default function CompassPage() {
  return <ClientApp />;
}
