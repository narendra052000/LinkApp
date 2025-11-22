/**
 * GET /healthz - Health check page that returns JSON via getServerSideProps
 */

import { GetServerSideProps } from 'next';

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  if (res) {
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 200;
    res.end(JSON.stringify({ ok: true, version: '1.0' }));
    return { props: {} };
  }

  return { props: {} };
};

export default function Healthz() {
  // This component is never rendered because getServerSideProps ends the response.
  return null;
}
