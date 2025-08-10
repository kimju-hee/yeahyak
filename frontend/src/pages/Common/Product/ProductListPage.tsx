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
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { instance } from '../../../api/api';
import ProductCardGrid from '../../../components/ProductCardGrid';
import { useAuthStore } from '../../../stores/authStore';
import {
  PRODUCT_MAIN_CATEGORY,
  PRODUCT_SUB_CATEGORY,
  type ProductMainCategory,
  type ProductResponse,
  type ProductSubCategoryWithAll,
} from '../../../types/product.type';
import { USER_ROLE } from '../../../types/profile.type';

const PAGE_SIZE = 12;
const MAIN_CATEGORIES = Object.values(PRODUCT_MAIN_CATEGORY);

export default function ProductListPage() {
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const [activeTab, setActiveTab] = useState<ProductMainCategory>('전문의약품');
  const [activeSubCategory, setActiveSubCategory] = useState<ProductSubCategoryWithAll>('전체');
  const [currentPage, setCurrentPage] = useState<number>(1);

  const [search, setSearch] = useState({
    field: 'productName' as 'productName' | 'manufacturer',
    keyword: '',
    appliedField: 'productName' as 'productName' | 'manufacturer',
    appliedKeyword: '',
  });

  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // TODO: API 연동 확인 (버전 A: 전체 조회 한 번만)
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await instance.get('/products'); // GET /api/products
        console.log('✨ 제품 목록 로딩 응답:', res.data);

        if (res.data?.success && Array.isArray(res.data.data)) {
          setProducts(res.data.data);
        } else {
          setProducts([]);
        }
      } catch (e: any) {
        console.error('제품 목록 로딩 실패:', e);
        messageApi.error(e.response?.data?.message || '제품 목록 로딩 중 오류가 발생했습니다.');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []); // 🔹 최초 1회만 호출

  // ✅ 1) 필터 + 검색 결과 계산 (프론트에서 처리)
  const filteredProducts = useMemo(() => {
    let arr = products;

    // 메인 카테고리
    if (activeTab) {
      arr = arr.filter((p) => p.mainCategory === activeTab);
    }
    // 서브 카테고리
    if (activeSubCategory !== '전체') {
      arr = arr.filter((p) => p.subCategory === activeSubCategory);
    }
    // 검색
    const kw = search.appliedKeyword.trim();
    if (kw) {
      arr = arr.filter((p) => {
        const target =
          search.appliedField === 'productName' ? p.productName : p.manufacturer;
        return (target ?? '').includes(kw);
      });
    }
    return arr;
  }, [products, activeTab, activeSubCategory, search.appliedField, search.appliedKeyword]);

  // ✅ 2) 페이지용 잘라내기
  const pagedProducts = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredProducts.slice(start, start + PAGE_SIZE);
  }, [filteredProducts, currentPage]);

  // ✅ 3) total 갱신 (필터/검색 후 개수)
  useEffect(() => {
    setTotal(filteredProducts.length);
  }, [filteredProducts]);

  const handleTabChange = (key: string) => {
    setActiveTab(key as ProductMainCategory);
    setActiveSubCategory('전체');
    setCurrentPage(1);
    setSearch({
      field: 'productName',
      keyword: '',
      appliedField: 'productName',
      appliedKeyword: '',
    });
    // NOTE: 버전 A에서는 재조회하지 않음(전체 목록 고정)
  };

  const handleSubCategoryChange = (value: string) => {
    setActiveSubCategory(value as ProductSubCategoryWithAll);
    setCurrentPage(1);
    // NOTE: 버전 A에서는 재조회하지 않음(전체 목록 고정)
  };

  const handleSearch = () => {
    setSearch((prev) => ({
      ...prev,
      appliedField: prev.field,
      appliedKeyword: prev.keyword.trim(),
    }));
    setCurrentPage(1);
    // NOTE: 버전 A에서는 재조회하지 않음(전체 목록 고정)
  };

  const tabsItems: TabsProps['items'] = MAIN_CATEGORIES.map((type) => {
    const subCategories: ProductSubCategoryWithAll[] = ['전체', ...PRODUCT_SUB_CATEGORY[type]];
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
                  setSearch((prev) => ({
                    ...prev,
                    field: value as 'productName' | 'manufacturer',
                  }))
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

          {loading ? <Skeleton active /> : <ProductCardGrid products={pagedProducts} />}
        </>
      ),
    };
  });

  return (
    <>
      {contextHolder}
      <Flex justify="space-between">
        <Typography.Title level={3} style={{ marginBottom: '24px' }}>
          제품 목록
        </Typography.Title>

        {true && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/hq/products/new')}
          >
            제품 등록
          </Button>
        )}
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
