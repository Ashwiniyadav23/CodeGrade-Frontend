import clsx from 'clsx'
import { twMerge } from 'tailwind-merge'
import React from 'react'
export const cn = (...a:any[]) => twMerge(clsx(a))
export const Button = ({ variant='primary', className, ...p }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?:'primary'|'outline'|'danger'|'ghost' }) =>
  <button className={cn('inline-flex h-9 items-center justify-center rounded-md px-3 text-sm font-medium transition disabled:opacity-50',
    { primary:'bg-blue-600 text-white hover:bg-blue-700', outline:'border border-zinc-200 bg-white hover:bg-zinc-100', danger:'bg-red-600 text-white hover:bg-red-700', ghost:'hover:bg-zinc-100' }[variant], className)} {...p}/>
export const Card = ({ className, ...p }: React.HTMLAttributes<HTMLDivElement>) => <div className={cn('rounded-lg border border-zinc-200 bg-white p-5', className)} {...p}/>
export const Label = ({ children }:{ children:React.ReactNode }) => <label className="mb-1 block text-xs font-medium text-zinc-500">{children}</label>
const tones:Record<string,string> = { blue:'bg-blue-50 text-blue-700', green:'bg-emerald-50 text-emerald-700', amber:'bg-amber-50 text-amber-700', gray:'bg-zinc-100 text-zinc-600', red:'bg-red-50 text-red-700' }
export const Badge = ({ tone='gray', children }:{ tone?:string; children:React.ReactNode }) => <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', tones[tone])}>{children}</span>
export const statusTone:Record<string,string> = { submitted:'blue', evaluating:'amber', review:'amber', published:'green', pending:'gray' }
export const PageHeader = ({ title, sub, action }:{ title:string; sub?:string; action?:React.ReactNode }) =>
  <div className="mb-6 flex items-start justify-between"><div><h1 className="text-xl font-semibold tracking-tight">{title}</h1>{sub && <p className="mt-1 text-sm text-zinc-500">{sub}</p>}</div>{action}</div>
