import { PlayerSilhouette } from '@/components/squad/PlayerSilhouette'
import type { PersonCardData } from '@/lib/data/content'

export function PersonCard({ person }: { person: PersonCardData }) {
  return (
    <article className="flex items-center gap-3.5 rounded-card border border-line bg-white p-4">
      <div
        aria-hidden="true"
        className="flex size-[72px] flex-[0_0_72px] items-end justify-center overflow-hidden rounded-full bg-navy"
      >
        <PlayerSilhouette
          photo={person.photo}
          sizes="72px"
          className={person.photo ? 'size-full object-cover' : 'w-[76%]'}
        />
      </div>
      <div className="min-w-0">
        <p className="m-0 text-[13px] font-semibold text-navy">{person.role}</p>
        <h3 className="m-0 mt-1 text-[17px] font-bold">{person.name}</h3>
        {person.sinceYear ? (
          <p className="m-0 mt-1 text-[13px] text-slate">Since {person.sinceYear}</p>
        ) : null}
      </div>
    </article>
  )
}
