import { Input, Select, Space } from 'antd';

interface SearchBoxProps {
  searchField: string;
  searchOptions: { label: string; value: string }[];
  searchKeyword: string;
  onSearchFieldChange?: (value: string) => void;
  onSearchKeywordChange: (value: string) => void;
  onSearch: (value: string) => void;
}

export function SearchBox({
  searchOptions,
  searchField,
  searchKeyword,
  onSearchFieldChange,
  onSearchKeywordChange,
  onSearch,
}: SearchBoxProps) {
  return (
    <Space.Compact>
      {searchOptions && searchField && onSearchFieldChange && (
        <Select value={searchField} onChange={onSearchFieldChange} options={searchOptions} />
      )}
      <Input.Search
        allowClear
        placeholder="검색어 입력"
        value={searchKeyword}
        onChange={(e) => onSearchKeywordChange(e.target.value)}
        onSearch={onSearch}
      />
    </Space.Compact>
  );
}
