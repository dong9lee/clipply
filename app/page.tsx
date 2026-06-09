import { prisma } from '@/lib/prisma'
import { STATUS_LIST, calcDday } from '@/lib/constants'
import Link from 'next/link'

export default async function DashboardPage() {
  const jobs = await prisma.job.findMany({ orderBy: { createdAt: 'desc' } })

  const total = jobs.length
  const appliedCount = jobs.filter(j =>
    ['APPLIED', 'DOCUMENT_PASSED', 'INTERVIEW', 'FINAL_PASSED'].includes(j.status)
  ).length
  const interviewCount = jobs.filter(j => j.status === 'INTERVIEW').length
  const passedCount = jobs.filter(j => j.status === 'FINAL_PASSED').length

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const sevenDaysLater = new Date(today)
  sevenDaysLater.setDate(sevenDaysLater.getDate() + 7)

  const upcoming = jobs
    .filter(j => {
      if (!j.deadline || j.status === 'REJECTED') return false
      const d = new Date(j.deadline)
      d.setHours(0, 0, 0, 0)
      return d >= today && d <= sevenDaysLater
    })
    .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime())

  const recent = jobs.slice(0, 5)

  const stats = [
    { label: '전체 공고', value: total },
    { label: '지원 완료', value: appliedCount },
    { label: '면접 진행', value: interviewCount },
    { label: '최종 합격', value: passedCount },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#2D2D2D]">대시보드</h1>
        <p className="mt-1 text-sm text-[#2D2D2D]/40">취업 현황을 한눈에 확인하세요</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <div
            key={s.label}
            className="bg-white rounded-xl p-5"
            style={{ border: '1px solid #E8E4DE' }}
          >
            <p className="text-sm text-[#2D2D2D]/45">{s.label}</p>
            <p className="text-3xl font-bold mt-1 text-[#2E4A7A]">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* D-7 임박 마감 */}
        <div className="bg-white rounded-xl p-5" style={{ border: '1px solid #E8E4DE' }}>
          <h2 className="font-semibold text-[#2D2D2D] mb-4">D-7 마감 임박</h2>
          {upcoming.length === 0 ? (
            <p className="text-sm py-6 text-center text-[#2D2D2D]/35">임박한 마감 공고가 없어요</p>
          ) : (
            <div>
              {upcoming.map((job, i) => {
                const dday = calcDday(job.deadline)
                const statusLabel = STATUS_LIST.find(s => s.value === job.status)?.label ?? job.status
                return (
                  <div
                    key={job.id}
                    className="flex items-center justify-between py-3"
                    style={i < upcoming.length - 1 ? { borderBottom: '1px solid #E8E4DE' } : undefined}
                  >
                    <div>
                      <p className="font-medium text-[#2D2D2D] text-sm">{job.company}</p>
                      <p className="text-xs mt-0.5 text-[#2D2D2D]/45">{job.position}</p>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{ background: '#FAF7F2', color: '#2E4A7A', border: '1px solid #E8E4DE' }}
                      >
                        {statusLabel}
                      </span>
                      <span className={`text-sm font-bold tabular-nums ${dday === 'D-day' ? 'text-red-500' : 'text-orange-400'}`}>
                        {dday}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* 최근 추가 공고 */}
        <div className="bg-white rounded-xl p-5" style={{ border: '1px solid #E8E4DE' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-[#2D2D2D]">최근 추가 공고</h2>
            <Link href="/jobs" className="text-sm text-[#2E4A7A] hover:underline">
              전체보기 →
            </Link>
          </div>
          {recent.length === 0 ? (
            <p className="text-sm py-6 text-center text-[#2D2D2D]/35">
              아직 공고가 없어요.{' '}
              <Link href="/jobs" className="text-[#2E4A7A] hover:underline">추가해보세요</Link>
            </p>
          ) : (
            <div>
              {recent.map((job, i) => {
                const statusLabel = STATUS_LIST.find(s => s.value === job.status)?.label ?? job.status
                return (
                  <div
                    key={job.id}
                    className="flex items-center justify-between py-3"
                    style={i < recent.length - 1 ? { borderBottom: '1px solid #E8E4DE' } : undefined}
                  >
                    <div>
                      <p className="font-medium text-[#2D2D2D] text-sm">{job.company}</p>
                      <p className="text-xs mt-0.5 text-[#2D2D2D]/45">{job.position}</p>
                    </div>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{ background: '#FAF7F2', color: '#2E4A7A', border: '1px solid #E8E4DE' }}
                    >
                      {statusLabel}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* 상태별 현황 */}
      <div className="bg-white rounded-xl p-5" style={{ border: '1px solid #E8E4DE' }}>
        <h2 className="font-semibold text-[#2D2D2D] mb-4">상태별 현황</h2>
        <div className="grid grid-cols-4 lg:grid-cols-7 gap-3">
          {STATUS_LIST.map(s => {
            const count = jobs.filter(j => j.status === s.value).length
            return (
              <Link
                key={s.value}
                href="/jobs"
                className="text-center rounded-xl py-4 px-2 bg-white transition-colors hover:bg-[#FAF7F2]"
                style={{ border: '1px solid #E8E4DE' }}
              >
                <p className="text-2xl font-bold text-[#2E4A7A]">{count}</p>
                <p className="text-xs mt-1 leading-tight text-[#2D2D2D]/45">{s.label}</p>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
