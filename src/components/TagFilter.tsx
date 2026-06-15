import { useEncyclopediaStore } from '../store/useEncyclopediaStore';
import type { Tag } from '../types';

export function TagFilter() {
  const { tags, selectedTag, setSelectedTag } = useEncyclopediaStore();

  const handleTagClick = (tagId: string) => {
    if (selectedTag === tagId) {
      setSelectedTag(null);
    } else {
      setSelectedTag(tagId);
    }
  };

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      <button
        onClick={() => setSelectedTag(null)}
        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
          selectedTag === null
            ? 'bg-slate-800 text-white shadow-lg scale-105'
            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
        }`}
      >
        全部
      </button>
      {tags.map((tag: Tag) => (
        <button
          key={tag.id}
          onClick={() => handleTagClick(tag.id)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
            selectedTag === tag.id
              ? 'text-white shadow-lg scale-105'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
          style={selectedTag === tag.id ? { backgroundColor: tag.color } : {}}
          title={tag.description}
        >
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: tag.color }}
          />
          {tag.name}
        </button>
      ))}
    </div>
  );
}
