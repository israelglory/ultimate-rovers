import { PlayerSilhouette } from '@/components/squad/PlayerSilhouette'
import type { PersonCardData } from '@/lib/data/content'

export function PersonCard({ person }: { person: PersonCardData }) {
  return (
    <article className="flex h-full flex-col items-start gap-3 rounded-card border border-line bg-white p-3.5 sm:flex-row sm:items-center sm:gap-3.5 sm:p-4">
      <div
        aria-hidden="true"
        className="flex size-14 shrink-0 items-end justify-center overflow-hidden rounded-full bg-navy sm:size-[72px]"
      >
        <PlayerSilhouette
          photo={person.photo}
          sizes="72px"
          className={person.photo ? 'size-full object-cover' : 'w-[76%]'}
        />
      </div>
      <div className="min-w-0">
        <p className="m-0 text-[13px] leading-snug font-semibold text-navy">{person.role}</p>
        <h3 className="m-0 mt-1 text-[15px] leading-snug font-bold sm:text-[17px]">
          {person.name}
        </h3>
        {person.sinceYear ? (
          <p className="m-0 mt-1 text-[13px] text-slate">Since {person.sinceYear}</p>
        ) : null}
      </div>
    </article>
  )
}
