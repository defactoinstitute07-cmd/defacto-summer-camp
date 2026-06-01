import React from "react";

// Table skeleton for admin list views (Announcements, Organizers, Volunteers, Points, Admins, etc.)
export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm w-full">
      {/* Table Header */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex gap-4">
        {[...Array(cols)].map((_, i) => (
          <div key={i} className="animate-shimmer h-4 bg-slate-200 rounded flex-1" />
        ))}
      </div>
      {/* Table Rows */}
      <div className="divide-y divide-slate-100">
        {[...Array(rows)].map((_, r) => (
          <div key={r} className="p-5 flex gap-4 items-center">
            {[...Array(cols)].map((_, c) => (
              <div key={c} className="animate-shimmer h-4 bg-slate-150 rounded flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// Sports card skeleton for home pages, games catalogs
export function SportsCardSkeleton() {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm flex flex-col h-full w-full">
      {/* Card Image */}
      <div className="animate-shimmer h-48 w-full bg-slate-200 flex-shrink-0" />
      {/* Card Content */}
      <div className="p-6 flex-1 flex flex-col space-y-4">
        <div className="flex items-center gap-2">
          <div className="animate-shimmer w-8 h-8 rounded-lg bg-slate-200" />
          <div className="animate-shimmer h-5 w-32 rounded bg-slate-200" />
        </div>
        <div className="space-y-2 flex-1">
          <div className="animate-shimmer h-4 w-full rounded bg-slate-200" />
          <div className="animate-shimmer h-4 w-5/6 rounded bg-slate-200" />
        </div>
        <div className="animate-shimmer h-10 w-full rounded-xl bg-slate-200" />
      </div>
    </div>
  );
}

// Match card skeleton for Game Details / Match lists
export function MatchCardSkeleton() {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4 w-full">
      <div className="flex justify-between items-center border-b border-slate-100 pb-3">
        <div className="animate-shimmer h-4 w-24 rounded bg-slate-200" />
        <div className="animate-shimmer h-5 w-16 rounded-full bg-slate-200" />
      </div>
      <div className="space-y-4 py-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="animate-shimmer w-5 h-5 rounded-full bg-slate-200" />
            <div className="animate-shimmer h-4 w-28 rounded bg-slate-200" />
          </div>
          <div className="animate-shimmer h-6 w-8 rounded bg-slate-200" />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="animate-shimmer w-5 h-5 rounded-full bg-slate-200" />
            <div className="animate-shimmer h-4 w-24 rounded bg-slate-200" />
          </div>
          <div className="animate-shimmer h-6 w-8 rounded bg-slate-200" />
        </div>
      </div>
      <div className="border-t border-slate-100 pt-3 flex justify-between items-center">
        <div className="animate-shimmer h-3.5 w-32 rounded bg-slate-200" />
        <div className="animate-shimmer h-5 w-14 rounded bg-slate-200" />
      </div>
    </div>
  );
}

// Card skeleton for grids like teams and players lists
export function CardSkeleton() {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 flex flex-col justify-between h-44 w-full">
      <div className="flex items-center gap-4">
        <div className="animate-shimmer w-16 h-16 rounded-xl bg-slate-200 flex-shrink-0" />
        <div className="space-y-2 flex-1">
          <div className="animate-shimmer h-5 w-3/4 rounded bg-slate-200" />
          <div className="animate-shimmer h-4 w-1/2 rounded bg-slate-200" />
        </div>
      </div>
      <div className="animate-shimmer h-8 w-full rounded-xl bg-slate-200 mt-4" />
    </div>
  );
}
