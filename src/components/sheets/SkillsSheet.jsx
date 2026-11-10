import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import { Sheet } from '../Sheet'

export function SkillsSheet({ portfolio, onClose }) {
  const [activeCategory, setActiveCategory] = useState('All')
  const categories = portfolio.skills || []
  const visibleGroups =
    activeCategory === 'All'
      ? categories
      : categories.filter((group) => group.category === activeCategory)

  return (
    <Sheet title="Skills & Capabilities" eyebrow="The toolkit" onClose={onClose}>
      <p className="sheet-lede">
        Grouped from the skills listed in my resume. No percentages, star ratings, or invented
        proficiency levels.
      </p>

      {categories.length > 1 ? (
        <div className="filter-bar" role="group" aria-label="Filter skills by category">
          <button
            className={`filter-chip ${activeCategory === 'All' ? 'is-active' : ''}`}
            onClick={() => setActiveCategory('All')}
            aria-pressed={activeCategory === 'All'}
          >
            All
          </button>
          {categories.map((group) => (
            <button
              key={group.category}
              className={`filter-chip ${activeCategory === group.category ? 'is-active' : ''}`}
              onClick={() => setActiveCategory(group.category)}
              aria-pressed={activeCategory === group.category}
            >
              {group.category}
            </button>
          ))}
        </div>
      ) : null}

      <div className="skill-groups">
        {visibleGroups.map((group) => (
          <section className="skill-group" key={group.category}>
            <div className="skill-group__heading">
              <span className="skill-group__dot" aria-hidden="true" />
              <h3>{group.category}</h3>
              <span>{group.items.length}</span>
            </div>
            <div className="chip-row">
              {group.items.map((item) => (
                <span className="chip" key={item}>
                  {item}
                </span>
              ))}
            </div>
          </section>
        ))}
      </div>

      {!categories.length ? (
        <div className="empty-state">
          <Sparkles size={22} />
          <h2>No skills listed yet</h2>
          <p>Skills will appear here when added in Studio.</p>
        </div>
      ) : null}
    </Sheet>
  )
}
