import clsx from 'clsx'
import { twMerge } from 'tailwind-merge'
import React from 'react'
export const cn = (...a:any[]) => twMerge(clsx(a))
export const Button = ({ variant='primary', className, ...p }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?:'primary'|'outline'|'danger'|'ghost' }) =>
  <button className={cn('inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition duration-150 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/20 active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-50',
    { primary:'bg-blue-700 text-white shadow-sm shadow-blue-700/20 hover:bg-blue-800', outline:'border border-slate-200 bg-white text-slate-700 shadow-sm hover:border-slate-300 hover:bg-slate-50', danger:'bg-red-600 text-white shadow-sm hover:bg-red-700', ghost:'text-slate-600 hover:bg-slate-100' }[variant], className)} {...p}/>
export const Card = ({ className, ...p }: React.HTMLAttributes<HTMLDivElement>) => <div className={cn('rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-200/30', className)} {...p}/>
export const Label = ({ children }:{ children:React.ReactNode }) => <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">{children}</label>
const tones:Record<string,string> = { blue:'bg-blue-50 text-blue-700 ring-blue-600/10', green:'bg-emerald-50 text-emerald-700 ring-emerald-600/10', amber:'bg-amber-50 text-amber-700 ring-amber-600/10', gray:'bg-slate-100 text-slate-600 ring-slate-600/10', red:'bg-red-50 text-red-700 ring-red-600/10' }
export const Badge = ({ tone='gray', children }:{ tone?:string; children:React.ReactNode }) => <span className={cn('rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset', tones[tone] ?? tones.gray)}>{children}</span>
export const statusTone:Record<string,string> = { submitted:'blue', evaluating:'amber', review:'amber', published:'green', pending:'gray' }
export const PageHeader = ({ title, sub, action }:{ title:string; sub?:string; action?:React.ReactNode }) =>
  <div className="mb-8 flex flex-col gap-4 border-b border-slate-200/70 pb-6 sm:flex-row sm:items-end sm:justify-between"><div><h1 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-[28px]">{title}</h1>{sub && <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">{sub}</p>}</div>{action}</div>
