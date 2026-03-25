import type { Category } from '../types/category';

interface CategoryBarProps {
  categories: Category[];
  selected: string | null;
  onSelect: (slug: string | null) => void;
}

export default function CategoryBar({ categories, selected, onSelect }: CategoryBarProps) {
  return (
    <div style={{
      display: 'flex',
      gap: '10px',
      flexWrap: 'wrap',
      padding: '16px 0',
    }}>
      <button
        onClick={() => onSelect(null)}
        style={{
          padding: '8px 20px',
          borderRadius: '999px',
          border: '1px solid #000',
          backgroundColor: selected === null ? '#000' : '#fff',
          color: selected === null ? '#fff' : '#000',
          cursor: 'pointer',
          fontSize: '13px',
          fontWeight: '500',
        }}
      >
        All
      </button>
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onSelect(cat.slug)}
          style={{
            padding: '8px 20px',
            borderRadius: '999px',
            border: '1px solid #000',
            backgroundColor: selected === cat.slug ? '#000' : '#fff',
            color: selected === cat.slug ? '#fff' : '#000',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: '500',
          }}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
}