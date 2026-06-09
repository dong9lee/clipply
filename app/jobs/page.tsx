import { prisma } from '@/lib/prisma'
import JobsClient from '@/components/JobsClient'

export default async function JobsPage() {
  const rawJobs = await prisma.job.findMany({ orderBy: { createdAt: 'desc' } })
  const jobs = rawJobs.map(j => ({
    id: j.id,
    company: j.company,
    position: j.position,
    url: j.url,
    deadline: j.deadline?.toISOString() ?? null,
    memo: j.memo,
    status: j.status,
    createdAt: j.createdAt.toISOString(),
  }))
  return <JobsClient jobs={jobs} />
}
