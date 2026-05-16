import PartnerPageClient from "./partner-page-client";

export const dynamicParams = true;

export function generateStaticParams() {
  return [
    { slug: "architects" },
    { slug: "developers" },
    { slug: "designers" },
    { slug: "wholesale" },
    { slug: "masters" },
    { slug: "foremen" },
    { slug: "dealers" },
  ];
}

export default async function PartnerPage({ params }: { params: Promise<{ slug: string }> }) {
  return <PartnerPageClient params={params} />;
}
