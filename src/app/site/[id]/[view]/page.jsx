import SitePerformanceDashboard from '@/app/components/SitePerformanceDashboard'

export default async function SitePage({ params }) {
 const { id ,view} = await params; 
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/site/${id}`, {
    cache: 'no-store',
  });
  if (!res.ok) return <div className="p-10">Report not found.</div>
  const siteData = await res.json()
  return <SitePerformanceDashboard preloadedData={siteData} view={view}/>
}
