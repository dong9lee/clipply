'use client'

import { useState, useTransition } from 'react'
import { STATUS_LIST, getStatus, calcDday } from '@/lib/constants'
import { createJob, updateJob, deleteJob } from '@/lib/actions'

export type JobRow = {
  id: string
  company: string
  position: string
  url: string | null
  deadline: string | null
  memo: string | null
  status: string
  createdAt: string
}

type FormState = {
  company: string
  position: string
  status: string
  url: string
  deadline: string
  memo: string
}

const emptyForm: FormState = {
  company: '',
  position: '',
  status: 'INTERESTED',
  url: '',
  deadline: '',
  memo: '',
}

export default function JobsClient({ jobs }: { jobs: JobRow[] }) {
  const [filter, setFilter] = useState('')
  const [editingId, setEditingId] = useState<string | 'new' | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [isPending, startTransition] = useTransition()

  const filtered = filter ? jobs.filter(j => j.status === filter) : jobs

  function openNew() {
    setForm(emptyForm)
    setEditingId('new')
  }

  function openEdit(job: JobRow) {
    setForm({
      company: job.company,
      position: job.position,
      status: job.status,
      url: job.url ?? '',
      deadline: job.deadline ? job.deadline.split('T')[0] : '',
      memo: job.memo ?? '',
    })
    setEditingId(job.id)
  }

  function closeModal() {
    setEditingId(null)
  }

  function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault()
    const data = {
      company: form.company.trim(),
      position: form.position.trim(),
      status: form.status,
      url: form.url.trim() || undefined,
      deadline: form.deadline || undefined,
      memo: form.memo.trim() || undefined,
    }
    startTransition(async () => {
      if (editingId === 'new') {
        await createJob(data)
      } else if (editingId) {
        await updateJob(editingId, data)
      }
      closeModal()
    })
  }

  function handleDelete(id: string) {
    if (!confirm('정말 삭제하시겠어요?')) return
    startTransition(async () => {
      await deleteJob(id)
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#2D2D2D]">공고 관리</h1>
        <button
          onClick={openNew}
          className="px-4 py-2 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer"
          style={{ background: "#2E4A7A" }}
          onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = "#263f68")}
          onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = "#2E4A7A")}
        >
          + 공고 추가
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilter('')}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer ${
            filter === '' ? 'text-white' : 'text-[#2D2D2D]/60 hover:bg-[#E8E4DE] hover:text-[#2D2D2D]'
          }`}
          style={filter === '' ? { background: "#2E4A7A" } : { background: "#E8E4DE" }}
        >
          전체 ({jobs.length})
        </button>
        {STATUS_LIST.map(s => {
          const count = jobs.filter(j => j.status === s.value).length
          if (count === 0) return null
          return (
            <button
              key={s.value}
              onClick={() => setFilter(s.value)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer ${
                filter === s.value ? 'text-white' : 'text-[#2D2D2D]/60 hover:bg-[#E8E4DE] hover:text-[#2D2D2D]'
              }`}
              style={filter === s.value ? { background: "#2E4A7A" } : { background: "#E8E4DE" }}
            >
              {s.label} ({count})
            </button>
          )
        })}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl overflow-hidden" style={{ border: "1px solid #E8E4DE" }}>
        {filtered.length === 0 ? (
          <div className="py-16 text-center" style={{ color: "#2D2D2D99" }}>
            <p className="text-lg">등록된 공고가 없어요</p>
            <button
              onClick={openNew}
              className="mt-3 text-sm hover:underline cursor-pointer"
              style={{ color: "#2E4A7A" }}
            >
              + 첫 번째 공고 추가하기
            </button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead style={{ background: "#FAF7F2", borderBottom: "1px solid #E8E4DE" }}>
              <tr>
                <th className="px-4 py-3 text-left font-medium text-[#2D2D2D]/50">회사</th>
                <th className="px-4 py-3 text-left font-medium text-[#2D2D2D]/50">직무</th>
                <th className="px-4 py-3 text-left font-medium text-[#2D2D2D]/50">상태</th>
                <th className="px-4 py-3 text-left font-medium text-[#2D2D2D]/50">마감일</th>
                <th className="px-4 py-3 text-left font-medium text-[#2D2D2D]/50">메모</th>
                <th className="px-4 py-3 w-20"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((job, i) => {
                const status = getStatus(job.status)
                const dday = calcDday(job.deadline)
                const deadlineStr = job.deadline
                  ? new Date(job.deadline).toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                    })
                  : null

                return (
                  <tr
                    key={job.id}
                    className="transition-colors hover:bg-[#FAF7F2]"
                    style={i < filtered.length - 1 ? { borderBottom: "1px solid #E8E4DE" } : undefined}
                  >
                    <td className="px-4 py-3 font-medium text-[#2D2D2D]">
                      <div className="flex items-center gap-1.5">
                        {job.company}
                        {job.url && (
                          <a
                            href={job.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs transition-colors hover:text-[#2E4A7A]"
                            style={{ color: "#2D2D2D66" }}
                            title="공고 링크"
                          >
                            ↗
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[#2D2D2D]/80">{job.position}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#2D2D2D]/70">
                      {deadlineStr ? (
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs">{deadlineStr}</span>
                          {dday && (
                            <span
                              className={`text-xs font-semibold ${
                                dday === 'D-day'
                                  ? 'text-red-600'
                                  : dday.startsWith('D-')
                                  ? parseInt(dday.slice(2)) <= 7
                                    ? 'text-orange-500'
                                    : 'text-[#2E4A7A]'
                                  : 'text-[#2D2D2D]/40'
                              }`}
                            >
                              {dday}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span style={{ color: "#2D2D2D33" }}>-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-[#2D2D2D]/60 max-w-xs">
                      {job.memo ? (
                        <span className="line-clamp-1 text-xs">{job.memo}</span>
                      ) : (
                        <span style={{ color: "#2D2D2D33" }}>-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEdit(job)}
                          className="p-1.5 rounded transition-colors cursor-pointer hover:bg-[#2E4A7A]/10 hover:text-[#2E4A7A]"
                          style={{ color: "#2D2D2D40" }}
                          title="수정"
                        >
                          ✎
                        </button>
                        <button
                          onClick={() => handleDelete(job.id)}
                          disabled={isPending}
                          className="p-1.5 rounded transition-colors cursor-pointer hover:bg-red-50 hover:text-red-500 disabled:opacity-40"
                          style={{ color: "#2D2D2D40" }}
                          title="삭제"
                        >
                          ✕
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {editingId !== null && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ background: "rgba(45,45,45,0.4)" }}
          onClick={e => { if (e.target === e.currentTarget) closeModal() }}
        >
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div
              className="px-6 py-4 flex items-center justify-between"
              style={{ borderBottom: "1px solid #E8E4DE" }}
            >
              <h2 className="text-lg font-semibold text-[#2D2D2D]">
                {editingId === 'new' ? '공고 추가' : '공고 수정'}
              </h2>
              <button
                onClick={closeModal}
                className="p-1 cursor-pointer text-[#2D2D2D]/40 hover:text-[#2D2D2D]"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
              {/* URL - 제일 위 */}
              <div>
                <label className="block text-sm font-medium text-[#2D2D2D] mb-1">공고 링크</label>
                <input
                  type="url"
                  value={form.url}
                  onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
                  placeholder="https://... 링크를 붙여넣으세요"
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none focus:ring-2"
                  style={{ border: "1px solid #E8E4DE" }}
                  onFocus={e => (e.currentTarget.style.borderColor = "#2E4A7A")}
                  onBlur={e => (e.currentTarget.style.borderColor = "#E8E4DE")}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2D2D2D] mb-1">
                  회사명 <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.company}
                  onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
                  required
                  placeholder="예) 카카오"
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                  style={{ border: "1px solid #E8E4DE" }}
                  onFocus={e => (e.currentTarget.style.borderColor = "#2E4A7A")}
                  onBlur={e => (e.currentTarget.style.borderColor = "#E8E4DE")}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2D2D2D] mb-1">
                  직무 / 포지션 <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.position}
                  onChange={e => setForm(f => ({ ...f, position: e.target.value }))}
                  required
                  placeholder="예) 프론트엔드 개발자"
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                  style={{ border: "1px solid #E8E4DE" }}
                  onFocus={e => (e.currentTarget.style.borderColor = "#2E4A7A")}
                  onBlur={e => (e.currentTarget.style.borderColor = "#E8E4DE")}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2D2D2D] mb-1">상태</label>
                <select
                  value={form.status}
                  onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                  style={{ border: "1px solid #E8E4DE" }}
                  onFocus={e => (e.currentTarget.style.borderColor = "#2E4A7A")}
                  onBlur={e => (e.currentTarget.style.borderColor = "#E8E4DE")}
                >
                  {STATUS_LIST.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2D2D2D] mb-1">마감일</label>
                <input
                  type="date"
                  value={form.deadline}
                  onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                  style={{ border: "1px solid #E8E4DE" }}
                  onFocus={e => (e.currentTarget.style.borderColor = "#2E4A7A")}
                  onBlur={e => (e.currentTarget.style.borderColor = "#E8E4DE")}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2D2D2D] mb-1">메모</label>
                <textarea
                  value={form.memo}
                  onChange={e => setForm(f => ({ ...f, memo: e.target.value }))}
                  rows={3}
                  placeholder="기억해 둘 내용을 자유롭게 적어보세요"
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none"
                  style={{ border: "1px solid #E8E4DE" }}
                  onFocus={e => (e.currentTarget.style.borderColor = "#2E4A7A")}
                  onBlur={e => (e.currentTarget.style.borderColor = "#E8E4DE")}
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors cursor-pointer hover:bg-[#E8E4DE]"
                  style={{ border: "1px solid #E8E4DE", color: "#2D2D2D" }}
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 px-4 py-2.5 text-white text-sm font-medium rounded-lg disabled:opacity-50 cursor-pointer transition-opacity"
                  style={{ background: "#2E4A7A" }}
                >
                  {isPending ? '저장 중...' : '저장'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
