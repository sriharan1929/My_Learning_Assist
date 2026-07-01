export function DataCard({ children, accent = false, onClick }) { return <article className={accent ? "data-card data-card-accent" : "data-card"} onClick={onClick}>{children}</article>; }
export function SectionGrid({ children, columns = "three" }) { return <div className={`section-grid section-grid-${columns}`}>{children}</div>; }
