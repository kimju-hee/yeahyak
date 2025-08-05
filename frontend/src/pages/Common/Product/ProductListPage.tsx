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

  // TODO: API 연동 확인
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await instance.get('/products/filter', {
        params: {
          mainCategory: activeTab,
          subCategory: activeSubCategory === '전체' ? undefined : activeSubCategory,
          searchKeyword: search.appliedKeyword,
          page: currentPage - 1,
          size: PAGE_SIZE,
        },
      });

      // LOG: 테스트용 로그
      console.log('✨ 제품 목록 로딩 응답:', res.data);

      if (res.data.success) {
        const { data, totalElements, currentPage: serverPage } = res.data;
        setProducts(data || []);
        setTotal(totalElements || 0);
        setCurrentPage(serverPage + 1);
      }
    } catch (e: any) {
      console.error('제품 목록 로딩 실패:', e);
      messageApi.error(e.response?.data?.message || '제품 목록 로딩 중 오류가 발생했습니다.');
      setProducts([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [activeTab, activeSubCategory, currentPage, search.appliedKeyword, search.appliedField]);

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
  };

  const handleSubCategoryChange = (value: string) => {
    setActiveSubCategory(value as ProductSubCategoryWithAll);
    setCurrentPage(1);
  };

  const handleSearch = () => {
    setSearch((prev) => ({
      ...prev,
      appliedField: prev.field,
      appliedKeyword: prev.keyword.trim(),
    }));
    setCurrentPage(1);
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
      {contextHolder}
      <Flex justify="space-between">
        <Typography.Title level={3} style={{ marginBottom: '24px' }}>
          제품 목록
        </Typography.Title>

        {user?.role === USER_ROLE.ADMIN && (
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
