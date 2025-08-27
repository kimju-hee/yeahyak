import { PlusOutlined } from '@ant-design/icons';
import {
  Button,
  Flex,
  message,
  Pagination,
  Space,
  Spin,
  Tabs,
  Typography,
  type TabsProps,
} from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { productAPI } from '../../../api';
import ProductCardGrid from '../../../components/ProductCardGrid';
import { SearchBox } from '../../../components/SearchBox';
import {
  MAIN_CATEGORY_OPTIONS,
  MAIN_CATEGORY_TEXT,
  PAGE_SIZE,
  SUB_CATEGORY_TEXT,
} from '../../../constants';
import { useAuthStore } from '../../../stores/authStore';
import {
  PRODUCT_CATEGORIES,
  USER_ROLE,
  type MainCategory,
  type ProductList,
  type SubCategoryWithAll,
  type User,
} from '../../../types';

const MAIN_CATEGORIES = MAIN_CATEGORY_OPTIONS.map((option) => option.value);

export default function ProductListPage() {
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const user = useAuthStore((state) => state.user) as User;
  const basePath = user.role === USER_ROLE.PHARMACY ? '/branch' : '/hq';

  const [products, setProducts] = useState<ProductList[]>([]);
  const [activeMainCategory, setActiveMainCategory] = useState<MainCategory>(
    (searchParams.get('main') as MainCategory) || '전문의약품',
  );
  const [activeSubCategory, setActiveSubCategory] = useState<SubCategoryWithAll>(
    (searchParams.get('sub') as SubCategoryWithAll) || '전체',
  );
  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
  const [appliedKeyword, setAppliedKeyword] = useState(searchParams.get('keyword') || '');

  const [currentPage, setCurrentPage] = useState<number>(Number(searchParams.get('page')) || 1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await productAPI.getProducts({
        mainCategory: activeMainCategory,
        subCategory: activeSubCategory === '전체' ? undefined : activeSubCategory,
        page: currentPage - 1,
        size: PAGE_SIZE,
        keyword: appliedKeyword ? appliedKeyword : undefined,
      });

      if (res.success) {
        const { data, page } = res;
        setProducts(data);
        setTotal(page.totalElements);
      } else {
        setProducts([]);
        setTotal(0);
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
  }, [activeMainCategory, activeSubCategory, currentPage, appliedKeyword]);

  useEffect(() => {
    const params = new URLSearchParams();
    params.set('main', activeMainCategory);
    params.set('sub', activeSubCategory);
    if (currentPage > 1) params.set('page', currentPage.toString());
    if (appliedKeyword) params.set('keyword', appliedKeyword);
    setSearchParams(params);
  }, [activeMainCategory, activeSubCategory, currentPage, appliedKeyword]);

  const handleMainCategoryChange = (key: string) => {
    setActiveMainCategory(key as MainCategory);
    setActiveSubCategory('전체');
    setKeyword('');
    setAppliedKeyword('');
    setCurrentPage(1);
  };

  const handleSubCategoryChange = (value: string) => {
    setActiveSubCategory(value as SubCategoryWithAll);
    setKeyword('');
    setAppliedKeyword('');
    setCurrentPage(1);
  };

  const handleSearch = (value: string) => {
    setKeyword(value.trim());
    setAppliedKeyword(value.trim());
    setCurrentPage(1);
  };

  const tabsItems: TabsProps['items'] = MAIN_CATEGORIES.map((category) => {
    const subCategories: SubCategoryWithAll[] = ['전체', ...PRODUCT_CATEGORIES[category]];
    return {
      key: category,
      label: MAIN_CATEGORY_TEXT[category],
      children: (
        <>
          <Flex justify="space-between">
            <Space wrap style={{ marginBottom: '16px' }}>
              {subCategories.map((category) => (
                <Button
                  key={category}
                  color={category === activeSubCategory ? 'primary' : 'default'}
                  variant={category === activeSubCategory ? 'outlined' : 'text'}
                  onClick={() => handleSubCategoryChange(category)}
                >
                  {category === '전체' ? '전체' : SUB_CATEGORY_TEXT[category]}
                </Button>
              ))}
            </Space>
            <SearchBox
              searchField="productName"
              searchOptions={[{ value: 'productName', label: '제품명' }]}
              searchKeyword={keyword}
              onSearchFieldChange={() => {}}
              onSearchKeywordChange={setKeyword}
              onSearch={handleSearch}
            />
          </Flex>

          {loading ? (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '240px',
              }}
            >
              <Spin size="large" />
            </div>
          ) : (
            <ProductCardGrid products={products} />
          )}
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

        {user.role === USER_ROLE.ADMIN && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate(`${basePath}/products/new`)}
          >
            제품 등록
          </Button>
        )}
      </Flex>

      <Tabs activeKey={activeMainCategory} onChange={handleMainCategoryChange} items={tabsItems} />

      <Pagination
        align="center"
        pageSize={PAGE_SIZE}
        total={total}
        current={currentPage}
        onChange={(page) => setCurrentPage(page)}
        showSizeChanger={false}
        style={{ marginTop: '24px' }}
      />
    </>
  );
}
