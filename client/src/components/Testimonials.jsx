/**
 * Demo testimonials — every card carries a visible "Sample" badge so it's
 * clear this content is illustrative, not real user data.
 */
const TESTIMONIALS = [
  {
    name: 'Priya S.',
    role: 'Product Designer',
    text: 'The accessibility notes alone saved us hours of auditing. UXLens caught contrast issues we had missed for weeks.',
    initials: 'PS',
  },
  {
    name: 'Marco L.',
    role: 'Indie Founder',
    text: 'Pasted my landing page, got a prioritized fix list in seconds. Clear enough to hand straight to my dev.',
    initials: 'ML',
  },
  {
    name: 'Aisha K.',
    role: 'Frontend Engineer',
    text: 'Love that it looks at an actual screenshot — the visual hierarchy feedback is surprisingly on point.',
    initials: 'AK',
  },
];

export default function Testimonials() {
  return (
    <section className="testimonials" aria-label="What people are saying">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">Demo quotes</span>
          <h2>Teams find UXLens genuinely useful</h2>
        </div>
        <div className="testimonial-grid">
          {TESTIMONIALS.map((t) => (
            <figure className="testimonial-card" key={t.initials}>
              <span className="badge badge-sample">Sample</span>
              <blockquote>“{t.text}”</blockquote>
              <figcaption>
                <span className="avatar">{t.initials}</span>
                <span>
                  <strong>{t.name}</strong>
                  <small>{t.role}</small>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
