'use server'

import { prisma } from './prisma'
import { revalidatePath } from 'next/cache'

type JobInput = {
  company: string
  position: string
  status: string
  url?: string
  deadline?: string
  memo?: string
}

export async function createJob(data: JobInput) {
  await prisma.job.create({
    data: {
      company: data.company,
      position: data.position,
      status: data.status,
      url: data.url || null,
      deadline: data.deadline ? new Date(data.deadline) : null,
      memo: data.memo || null,
    },
  })
  revalidatePath('/')
  revalidatePath('/jobs')
}

export async function updateJob(id: string, data: JobInput) {
  await prisma.job.update({
    where: { id },
    data: {
      company: data.company,
      position: data.position,
      status: data.status,
      url: data.url || null,
      deadline: data.deadline ? new Date(data.deadline) : null,
      memo: data.memo || null,
    },
  })
  revalidatePath('/')
  revalidatePath('/jobs')
}

export async function deleteJob(id: string) {
  await prisma.job.delete({ where: { id } })
  revalidatePath('/')
  revalidatePath('/jobs')
}
