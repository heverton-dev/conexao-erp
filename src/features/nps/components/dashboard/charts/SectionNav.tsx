interface NavItem {
  id: string;
  label: string;
}

interface SectionNavProps {
  items: NavItem[];
  value: string;
  onChange: (id: string) => void;
}

const ALL_SECTIONS_ID = "todas";

interface SectionNavPropsExtended extends SectionNavProps {
  allLabel?: string;
}

const SectionNav = ({
  items,
  value,
  onChange,
  allLabel = "Ver todas as métricas",
}: SectionNavPropsExtended) => {
  const allItems = [{ id: ALL_SECTIONS_ID, label: allLabel }, ...items];

  return (
    <>
      {/* Desktop tabs */}
      <div className="hidden md:flex flex-wrap items-center gap-3">
        {allItems.map((item) => {
          const active = value === item.id;
          const isAll = item.id === ALL_SECTIONS_ID;
          return (
            <button
              key={item.id}
              onClick={() => onChange(item.id)}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all border ${
                active
                  ? isAll
                    ? "bg-accent/20 text-accent border-accent/50 shadow-[0_0_0_2px_rgba(201,166,85,0.15)] ring-1 ring-accent/20"
                    : "bg-accent/15 text-accent border-accent/40"
                  : "bg-secondary/60 text-muted-foreground border-border/40 hover:text-text-main hover:bg-accent/10 hover:border-border/60"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      {/* Mobile select */}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="md:hidden bg-secondary/80 border border-border/50 text-text-main text-sm rounded-lg px-3 py-2.5 w-full"
      >
        {allItems.map((item) => (
          <option key={item.id} value={item.id}>
            {item.label}
          </option>
        ))}
      </select>
    </>
  );
};

export default SectionNav;
