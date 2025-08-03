import { PlusOutlined } from '@ant-design/icons';
import {
  Button,
  Flex,
  Input,
  message,
  Pagination,
  Select,
  Skeleton,
  Space,
  Tabs,
  Typography,
  type TabsProps,
} from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductCardGrid from '../../../components/ProductCardGrid';
import { useAuthStore } from '../../../stores/authStore';
import {
  SUB_CATEGORY_MAP,
  TYPES,
  type Product,
  type SubCategoryWithAll,
  type Type,
} from '../../../types/product';
import { mockProducts } from '../../../types/product.mock';

const PAGE_SIZE = 12;

export default function ProductListPage() {
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const [activeTab, setActiveTab] = useState<Type>('전문의약품');
  const [activeSubCategory, setActiveSubCategory] = useState<SubCategoryWithAll>('전체');
  const [currentPage, setCurrentPage] = useState<number>(1);

  const [search, setSearch] = useState({
    field: 'productName' as 'productName' | 'manufacturer',
    keyword: '',
    appliedField: 'productName' as 'productName' | 'manufacturer',
    appliedKeyword: '',
  });

  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      // TODO: 제품 목록 로드 API 호출 로직 추가 + mockProducts 제거
      // const params: {
      //   type: TabKey;
      //   page: number;
      //   pageSize: number;
      //   subCategory?: string;
      //   searchField?: string;
      //   searchKeyword?: string;
      // } = {
      //   type: activeTab,
      //   page: currentPage,
      //   pageSize: PAGE_SIZE,
      // };
      //
      // if (activeSubCategory !== '전체') {
      //   params.searchField = search.appliedField;
      //   params.searchKeyword = search.appliedKeyword.trim();
      // }
      //
      // const res = await instance.get('/products', { params });
      //
      // if (res.data.success) {
      //   setProducts(res.data.data);
      //   setTotal(res.data.total);
      // }

      // 1. 대분류 필터
      let filtered = mockProducts.filter((p) => p.type === activeTab);

      // 2. 소분류 필터
      if (activeSubCategory !== '전체') {
        filtered = filtered.filter((p) => p.subCategory === activeSubCategory);
      }

      // 3. 검색 필터
      if (search.appliedKeyword.trim()) {
        filtered = filtered.filter((p) =>
          (p[search.appliedField] as string)
            .toLowerCase()
            .includes(search.appliedKeyword.toLowerCase()),
        );
      }

      // 4. 페이지네이션 처리
      const startIndex = (currentPage - 1) * PAGE_SIZE;
      const paginated = filtered.slice(startIndex, startIndex + PAGE_SIZE);

      // 5. 상태 저장
      setProducts(paginated);
      setTotal(filtered.length);
    } catch (e: any) {
      console.error('제품 목록 로딩 실패:', e);
      messageApi.error(e.message || '제품 목록 로딩 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [activeTab, activeSubCategory, currentPage, search.appliedKeyword, search.appliedField]);

  const handleTabChange = (key: string) => {
    setActiveTab(key as Type);
    setActiveSubCategory('전체');
    setCurrentPage(1);
    setSearch({
      field: 'productName',
      keyword: '',
      appliedField: 'productName',
      appliedKeyword: '',
    });
  };

  const handleSubCategoryChange = (value: string) => {
    setActiveSubCategory(value as SubCategoryWithAll);
    setCurrentPage(1);
  };

  const handleSearch = () => {
    setSearch((prev) => ({
      ...prev,
      appliedKeyword: prev.keyword.trim(),
      appliedField: prev.field,
    }));
    setCurrentPage(1);
  };

  const tabsItems: TabsProps['items'] = TYPES.map((type) => {
    const subCategories: SubCategoryWithAll[] = ['전체', ...SUB_CATEGORY_MAP[type]];
    return {
      key: type,
      label: type,
      children: (
        <>
          <Flex justify="space-between">
            <Space wrap style={{ marginBottom: '16px' }}>
              {subCategories.map((cat) => (
                <Button
                  key={cat}
                  color={cat === activeSubCategory ? 'primary' : 'default'}
                  variant={cat === activeSubCategory ? 'outlined' : 'text'}
                  onClick={() => handleSubCategoryChange(cat)}
                >
                  {cat}
                </Button>
              ))}
            </Space>
            <Space.Compact>
              <Select
                value={search.field}
                onChange={(value) =>
                  setSearch((prev) => ({ ...prev, field: value as 'productName' | 'manufacturer' }))
                }
                options={[
                  { value: 'productName', label: '제품명' },
                  { value: 'manufacturer', label: '제조사' },
                ]}
              />
              <Input.Search
                allowClear
                value={search.keyword}
                onChange={(e) => setSearch((prev) => ({ ...prev, keyword: e.target.value }))}
                onSearch={handleSearch}
              />
            </Space.Compact>
          </Flex>
          {loading ? <Skeleton active /> : <ProductCardGrid products={products} />}
        </>
      ),
    };
  });

  return (
    <>
      <Flex justify="space-between">
        <Typography.Title level={3} style={{ marginBottom: '24px' }}>
          제품 목록
        </Typography.Title>

        {/* TODO: 로그인 API 연동 후 주석 해제 {user.role === 'HQ' && ( */}
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/hq/products/new')}>
          제품 등록
        </Button>
      </Flex>

      <Tabs activeKey={activeTab} onChange={handleTabChange} items={tabsItems} />
      <Pagination
        align="center"
        current={currentPage}
        total={total}
        pageSize={PAGE_SIZE}
        onChange={(page) => setCurrentPage(page)}
        style={{ marginTop: '24px' }}
      />
    </>
  );
}
