import { Avatar, Icon } from '@/ui';

export interface Member {
  n: string;
  t?: '' | 't' | 's';
}

export function TripCard({
  name,
  place,
  date,
  m,
  dist,
  members = [],
  status,
  onClick,
}: {
  name: string;
  place: string;
  date: string;
  m: string;
  dist: string;
  members?: Member[];
  status: string;
  onClick?: () => void;
}) {
  return (
    <div
      className="card w-full max-w-[260px] flex-none cursor-pointer overflow-hidden"
      onClick={onClick}
    >
      <div className="imgslot topo h-[116px] items-start justify-between">
        <span className="chip m-2.5 backdrop-blur" style={{ background: 'color-mix(in srgb,var(--bg) 60%,transparent)' }}>
          <Icon name="calendar" size={13} /> {date}
        </span>
        <span className={`chip m-2.5 ${status === 'Confirmada' ? 'chip--accent' : 'chip--terra'}`}>{status}</span>
      </div>
      <div className="px-3.5 pb-3.5 pt-3">
        <h3 className="text-[19px]">{name}</h3>
        <div className="row gap6 faint mt-1 text-[13px]">
          <Icon name="pin" size={13} /> {place}
        </div>
        <div className="row gap12 mono mt-2.5 text-xs text-ink-2">
          <span className="row gap4">
            <Icon name="elev" size={14} /> {m} m
          </span>
          <span className="row gap4">
            <Icon name="ruler" size={14} /> {dist} km
          </span>
        </div>
        {members.length > 0 && (
          <div className="row mt-3 pl-1.5">
            {members.map((mm, i) => (
              <Avatar key={i} name={mm.n} tone={mm.t} size={26} ring style={{ marginLeft: -6 }} />
            ))}
            <span className="faint mono ml-2 text-[11px]">{members.length} van</span>
          </div>
        )}
      </div>
    </div>
  );
}

export function FeedCard({
  who,
  tone,
  guide,
  place,
  name,
  m,
  dist,
  time,
  kudos,
  comments,
  photo,
}: {
  who: string;
  tone?: '' | 't' | 's';
  guide?: boolean;
  place: string;
  name: string;
  m: string;
  dist: string;
  time: string;
  kudos: string | number;
  comments: string | number;
  photo?: string;
}) {
  return (
    <article className="card mb-3 p-3.5">
      <div className="row gap10">
        <Avatar name={who} tone={tone} size={40} />
        <div className="grow min-w-0">
          <div className="row gap6 flex-wrap">
            <strong className="text-[15px]">{who}</strong>
            {guide && (
              <span className="chip chip--guide" style={{ fontSize: 9.5, padding: '2px 7px' }}>
                <Icon name="shield" size={11} /> Guía
              </span>
            )}
          </div>
          <div className="faint text-[12.5px]">completó una salida · {time}</div>
        </div>
        <Icon name="more" size={18} className="text-ink-3" />
      </div>
      <h3 className="mt-3 text-[21px]">{name}</h3>
      <div className="row gap6 faint mt-1 text-[13px]">
        <Icon name="pin" size={13} /> {place}
      </div>
      {photo && (
        <div className="imgslot topo mt-3 h-[150px] items-end rounded-card">
          <span className="imgslot__tag">foto · {photo}</span>
        </div>
      )}
      <div className="row gap16 mono mt-3 text-[13px]">
        <span>
          <span className="faint">Desnivel</span>
          <br />
          <span className="text-base text-ink">{m} m</span>
        </span>
        <span>
          <span className="faint">Distancia</span>
          <br />
          <span className="text-base text-ink">{dist} km</span>
        </span>
        <span>
          <span className="faint">Vivacs</span>
          <br />
          <span className="text-base text-accent">+1</span>
        </span>
      </div>
      <hr className="hr my-3" />
      <div className="row gap20 faint text-[13.5px]">
        <span className="row gap6">
          <Icon name="heart" size={18} /> {kudos}
        </span>
        <span className="row gap6">
          <Icon name="chat" size={18} /> {comments}
        </span>
        <span className="row gap6 ml-auto">
          <Icon name="share" size={18} />
        </span>
      </div>
    </article>
  );
}

export function TipCard({
  title,
  who,
  tone,
  guide,
  cat,
  mins,
  likes,
  big,
  onClick,
}: {
  title: string;
  who: string;
  tone?: '' | 't' | 's';
  guide?: boolean;
  cat: string;
  mins: string | number;
  likes: string | number;
  big?: boolean;
  onClick?: () => void;
}) {
  return (
    <article className="card mb-3 cursor-pointer overflow-hidden" onClick={onClick}>
      <div className={`imgslot topo items-start ${big ? 'h-[150px]' : 'h-[104px]'}`}>
        <span className="chip chip--terra m-2.5">{cat}</span>
      </div>
      <div className="px-3.5 pb-3.5 pt-3">
        <h3 className={`leading-tight ${big ? 'text-[21px]' : 'text-[17px]'}`}>{title}</h3>
        <div className="row gap8 mt-2.5">
          <Avatar name={who} tone={tone} size={26} />
          <div className="grow row gap6 min-w-0">
            <span className="text-[13px]">{who}</span>
            {guide && (
              <span className="chip chip--guide" style={{ fontSize: 8.5, padding: '1px 6px' }}>
                <Icon name="shield" size={10} /> Guía
              </span>
            )}
          </div>
          <span className="faint mono row gap4 text-[11px]">
            <Icon name="clock" size={12} /> {mins}'
          </span>
          <span className="faint mono row gap4 text-[11px]">
            <Icon name="heart" size={12} /> {likes}
          </span>
        </div>
      </div>
    </article>
  );
}
