import type { PropsWithChildren, ReactNode } from "react";

/**
 * Props for the SectionCard component.
 */
interface SectionCardProps extends PropsWithChildren {
  /** Optional title for the card header. */
  title?: string;
  /** Optional descriptive text for the card header. */
  description?: string;
  /** Optional React nodes to display in the header actions area. */
  actions?: ReactNode;
  /** Additional CSS class names. */
  className?: string;
}

/**
 * A reusable layout component that provides a consistent container for content sections.
 */
export function SectionCard({
  title,
  description,
  actions,
  children,
  className = "",
}: SectionCardProps) {
  return (
    <section className={`section-card ${className}`.trim()}>
      {(title || description || actions) && (
        <header className="section-card__header">
          <div>
            {title ? <h2>{title}</h2> : null}
            {description ? <p>{description}</p> : null}
          </div>
          {actions ? (
            <div className="section-card__actions">{actions}</div>
          ) : null}
        </header>
      )}
      <div className="section-card__content">{children}</div>
    </section>
  );
}
