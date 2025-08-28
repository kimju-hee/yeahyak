// import {
//   Button,
//   DatePicker,
//   Flex,
//   Popconfirm,
//   Select,
//   Spin,
//   Table,
//   Tag,
//   Typography,
//   message,
//   type TableProps,
// } from 'antd';
// import dayjs, { type Dayjs } from 'dayjs';
// import { useEffect, useState } from 'react';
// import { pharmacyAPI } from '../../api';
// import { SearchBox } from '../../components/SearchBox';
// import {
//   BALANCE_TX_TYPE_COLORS,
//   BALANCE_TX_TYPE_OPTIONS,
//   BALANCE_TX_TYPE_TEXT,
//   DATE_FORMAT,
//   PAGE_SIZE,
//   REGION_TEXT,
// } from '../../constants';
// import type { BalanceTxList, BalanceTxType, PharmacyList, Region } from '../../types';
// import { calculateCreditInfo } from '../../utils/credit.util';

// // 외상 잔액에 따른 상태 태그 생성
// const getBalanceStatusTag = (outstandingBalance: number) => {
//   const creditInfo = calculateCreditInfo(outstandingBalance);

//   let color: string;
//   let text: string;

//   if (creditInfo.usagePercent <= 50) {
//     color = 'success';
//     text = '안전';
//   } else if (creditInfo.usagePercent <= 80) {
//     color = 'warning';
//     text = '주의';
//   } else {
//     color = 'error';
//     text = '위험';
//   }

//   return (
//     <Tag color={color} style={{ cursor: 'default' }}>
//       {text} ({creditInfo.usagePercent.toFixed(1)}%)
//     </Tag>
//   );
// };

// export default function CreditManagementPage() {
//   const [messageApi, contextHolder] = message.useMessage();

//   const [pharmacies, setPharmacies] = useState<PharmacyList[]>([]);
//   const [search, setSearch] = useState({
//     field: 'pharmacyName' as 'pharmacyName',
//     keyword: undefined as string | undefined,
//     appliedField: 'pharmacyName' as 'pharmacyName',
//     appliedKeyword: undefined as string | undefined,
//     region: undefined as Region | undefined,
//     appliedRegion: undefined as Region | undefined,
//   });

//   const [currentPage, setCurrentPage] = useState<number>(1);
//   const [total, setTotal] = useState<number>(0);
//   const [loading, setLoading] = useState<boolean>(false);

//   // 확장된 행 관련 상태
//   const [expandedRowData, setExpandedRowData] = useState<Record<number, BalanceTxList[]>>({});
//   const [expandedRowLoading, setExpandedRowLoading] = useState<Record<number, boolean>>({});
//   const [expandedRowKeys, setExpandedRowKeys] = useState<number[]>([]);

//   // 거래내역 필터 상태
//   const [balanceFilter, setBalanceFilter] = useState<{
//     type?: BalanceTxType;
//     startDate?: Dayjs;
//     endDate?: Dayjs;
//   }>({});

//   const fetchPharmacies = async () => {
//     setLoading(true);
//     try {
//       const res = await pharmacyAPI.getPharmacies({
//         unsettled: false,
//         page: currentPage - 1,
//         size: PAGE_SIZE,
//         keyword: search.appliedKeyword || undefined,
//         region: search.appliedRegion || undefined,
//       });

//       if (res.success) {
//         const { data, page } = res;
//         setPharmacies(data);
//         setTotal(page.totalElements);
//       }
//     } catch (e: any) {
//       console.error('약국 목록 로딩 실패:', e);
//       messageApi.error('약국 목록을 불러오는데 실패했습니다.');
//       setPharmacies([]);
//       setTotal(0);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchPharmacies();
//   }, [currentPage, search.appliedKeyword, search.appliedRegion]);

//   // 약국별 거래내역 조회
//   const fetchBalanceTransactions = async (pharmacyId: number) => {
//     setExpandedRowLoading((prev) => ({ ...prev, [pharmacyId]: true }));
//     try {
//       const res = await pharmacyAPI.getBalanceTxs({
//         pharmacyId,
//         type: balanceFilter.type,
//         start: balanceFilter.startDate?.format('YYYY-MM-DD'),
//         end: balanceFilter.endDate?.format('YYYY-MM-DD'),
//         page: 0,
//         size: 50,
//       });

//       if (res.success) {
//         setExpandedRowData((prev) => ({ ...prev, [pharmacyId]: res.data }));
//       }
//     } catch (e: any) {
//       console.error('거래내역 조회 실패:', e);
//       messageApi.error(e.response?.data?.message || '거래내역 조회 중 오류가 발생했습니다.');
//     } finally {
//       setExpandedRowLoading((prev) => ({ ...prev, [pharmacyId]: false }));
//     }
//   };

//   // 행 확장 처리
//   const handleExpand = (expanded: boolean, record: PharmacyList) => {
//     const pharmacyId = record.pharmacyId;
//     if (expanded) fetchBalanceTransactions(pharmacyId);
//     setExpandedRowKeys(
//       expanded
//         ? [...expandedRowKeys, pharmacyId]
//         : expandedRowKeys.filter((key) => key !== pharmacyId),
//     );
//   };

//   const handleSettlement = async (pharmacyId: number, pharmacyName: string) => {
//     try {
//       const res = await pharmacyAPI.settlement(pharmacyId);

//       if (res.success) {
//         messageApi.success(`${pharmacyName} 정산 처리가 완료되었습니다.`);
//         fetchPharmacies(); // 목록 새로고침
//       }
//     } catch (e: any) {
//       console.error('정산 처리 실패:', e);
//       messageApi.error(e.response?.data?.message || '정산 처리 중 오류가 발생했습니다.');
//     }
//   };

//   // 확장된 행 렌더링 (거래내역 테이블)
//   const expandedRowRender = (record: PharmacyList) => {
//     const transactions = expandedRowData[record.pharmacyId] || [];
//     const isLoading = expandedRowLoading[record.pharmacyId];

//     if (isLoading) return <Spin />;

//     const balanceTxColumns: TableProps<BalanceTxList>['columns'] = [
//       {
//         title: '날짜',
//         dataIndex: 'createdAt',
//         key: 'createdAt',
//         render: (value) => dayjs(value).format(DATE_FORMAT.KR_DEFAULT),
//         width: 180,
//       },
//       {
//         title: '거래유형',
//         dataIndex: 'type',
//         key: 'type',
//         render: (type: BalanceTxType) => (
//           <Tag color={BALANCE_TX_TYPE_COLORS[type]}>{BALANCE_TX_TYPE_TEXT[type]}</Tag>
//         ),
//         width: 100,
//       },
//       {
//         title: '금액',
//         dataIndex: 'amount',
//         key: 'amount',
//         render: (value, record) => {
//           const isPositive = record.type === 'RETURN' || record.type === 'ORDER_CANCEL';
//           return (
//             <span style={{ color: isPositive ? '#52c41a' : '#f5222d' }}>
//               {isPositive ? '+' : '-'}
//               {Math.abs(value).toLocaleString()}원
//             </span>
//           );
//         },
//         align: 'right',
//         width: 120,
//       },
//       {
//         title: '잔액',
//         dataIndex: 'balanceAfter',
//         key: 'balanceAfter',
//         render: (value) => <span style={{ fontWeight: 'bold' }}>{value.toLocaleString()}원</span>,
//         align: 'right',
//         width: 120,
//       },
//     ];

//     return (
//       <>
//         <Flex gap="middle" style={{ marginBottom: '12px' }}>
//           <Select
//             placeholder="거래유형 선택"
//             allowClear
//             style={{ width: 150 }}
//             options={[...BALANCE_TX_TYPE_OPTIONS]}
//             onChange={(value) => setBalanceFilter((prev) => ({ ...prev, type: value }))}
//           />
//           <DatePicker.RangePicker
//             placeholder={['시작일', '종료일']}
//             format="YYYY-MM-DD"
//             onChange={(dates) => {
//               setBalanceFilter((prev) => ({
//                 ...prev,
//                 startDate: dates?.[0] || undefined,
//                 endDate: dates?.[1] || undefined,
//               }));
//             }}
//           />
//           <Button type="primary" onClick={() => fetchBalanceTransactions(record.pharmacyId)}>
//             조회
//           </Button>
//         </Flex>
//         <Table
//           size="small"
//           columns={balanceTxColumns}
//           dataSource={transactions}
//           rowKey="balanceTxId"
//           pagination={false}
//           scroll={{ y: 300 }}
//         />
//       </>
//     );
//   };

//   const tableColumns: TableProps<PharmacyList>['columns'] = [
//     {
//       title: '약국코드',
//       dataIndex: 'pharmacyId',
//       key: 'pharmacyId',
//       width: 100,
//       align: 'center',
//     },
//     {
//       title: '약국명',
//       dataIndex: 'pharmacyName',
//       key: 'pharmacyName',
//     },
//     {
//       title: '사업자등록번호',
//       dataIndex: 'bizRegNo',
//       key: 'bizRegNo',
//       align: 'center',
//     },
//     {
//       title: '대표자명',
//       dataIndex: 'representativeName',
//       key: 'representativeName',
//       align: 'center',
//     },
//     {
//       title: '지역',
//       dataIndex: 'region',
//       key: 'region',
//       render: (region: Region) => REGION_TEXT[region],
//       align: 'center',
//     },
//     {
//       title: '외상잔액',
//       dataIndex: 'outstandingBalance',
//       key: 'outstandingBalance',
//       render: (value) => <span style={{ fontWeight: 'bold' }}>{value.toLocaleString()}원</span>,
//       align: 'right',
//     },
//     {
//       title: '신용상태',
//       dataIndex: 'outstandingBalance',
//       key: 'creditStatus',
//       render: (outstandingBalance) => getBalanceStatusTag(outstandingBalance),
//       align: 'center',
//     },
//     {
//       title: '최근정산일',
//       dataIndex: 'latestSettlementAt',
//       key: 'latestSettlementAt',
//       render: (value) => (value ? dayjs(value).format(DATE_FORMAT.KR_DATE) : '-'),
//       align: 'center',
//     },
//     {
//       title: '정산',
//       key: 'settlement',
//       render: (_, record) => (
//         <Popconfirm
//           title="정산 처리"
//           description={`${record.pharmacyName}의 외상잔액 ${record.outstandingBalance.toLocaleString()}원을 정산하시겠습니까?`}
//           onConfirm={() => handleSettlement(record.pharmacyId, record.pharmacyName)}
//           okText="정산"
//           cancelText="취소"
//           disabled={record.outstandingBalance <= 0}
//         >
//           <Button type="primary" size="small" disabled={record.outstandingBalance <= 0}>
//             정산
//           </Button>
//         </Popconfirm>
//       ),
//       align: 'center',
//     },
//   ];

//   return (
//     <>
//       {contextHolder}
//       <Typography.Title level={3} style={{ marginBottom: '24px' }}>
//         정산 관리
//       </Typography.Title>

//       <Flex gap="middle" style={{ marginBottom: '16px' }}>
//         <SearchBox
//           searchField={search.field}
//           searchOptions={[{ value: 'pharmacyName', label: '약국명' }]}
//           searchKeyword={search.keyword || ''}
//           onSearchKeywordChange={(value) => setSearch((prev) => ({ ...prev, keyword: value }))}
//           onSearch={() => {
//             setSearch((prev) => ({
//               ...prev,
//               appliedField: prev.field,
//               appliedKeyword: prev.keyword,
//             }));
//             setCurrentPage(1);
//           }}
//         />
//       </Flex>

//       <Table
//         columns={tableColumns}
//         dataSource={pharmacies}
//         loading={loading}
//         rowKey={(record) => record.pharmacyId}
//         pagination={{
//           position: ['bottomCenter'],
//           pageSize: PAGE_SIZE,
//           total: total,
//           current: currentPage,
//           onChange: (page) => setCurrentPage(page),
//           showSizeChanger: false,
//         }}
//         expandable={{
//           expandedRowRender,
//           onExpand: handleExpand,
//           expandedRowKeys,
//           expandRowByClick: true,
//           expandIcon: () => null,
//         }}
//         style={{ marginTop: '24px' }}
//       />
//     </>
//   );
// }
