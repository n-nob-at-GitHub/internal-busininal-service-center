'use client'
import {
  MouseEvent,
  ReactNode,
  SyntheticEvent,
  useState
} from 'react'
import {
  Box,
  Menu, 
  MenuItem,
  Tab,
  Tabs,
} from '@mui/material'
import DeliverySites from '@/components/DeliverySites'
import Inbound from '@/components/Inbound'
import InboundHistories from '@/components/InboundHistories'
import Licenses from '@/components/Licenses'
import Manufacturers from '@/components/Manufacturers'
import Materials from '@/components/Materials'
import Outbound from '@/components/Outbound'
import OutboundHistories from '@/components/OutboundHistories'
import Overview from '@/components/Overview'
import Roles from '@/components/Roles'
import Stocks from '@/components/Stocks'
import Users from '@/components/Users'
import { useUser } from '@/hooks/useUser'

interface TabPanelProps {
  children?: ReactNode;
  index: number;
  value: number;
}

type StockKey = '在庫一覧' | '入庫' | '出庫' | '入庫履歴' | '出庫履歴'
type MasterKey = '資材' | '製造メーカー' | '配送先' | 'ユーザー' | 'ロール' 
type OtherKey = 'ライセンス表示' | 'アプリ機能説明'

const CustomTabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;
  return (
    <div
      role='tabpanel'
      hidden={ value !== index }
      id={`simple-tabpanel-${ index }`}
      aria-labelledby={`simple-tab-${ index }`}
      { ...other }
    >
      { value === index && <Box sx={{ p: 3 }}>{ children }</Box> }
    </div>
  );
}

const a11yProps = (index: number) => {
  return {
    id: `simple-tab-${ index }`,
    'aria-controls': `simple-tabpanel-${ index }`,
  };
}

const Contents = () => {
  const user = useUser()
  const role = process.env.NODE_ENV === 'development'
    ? 'SYSTEM'
    : (user as any)?.role || 'SYSTEM'

  const [ tabIndex, setTabIndex ] = useState(0);
  const [ stockMenu, setStockMenu ] = useState<StockKey | null>(null)
  const [ masterMenu, setMasterMenu ] = useState<MasterKey | null>(null)
  const [ stockAnchorElement, setStockAnchorElement ] = useState<null | HTMLElement>(null)
  const [ masterAnchorElement, setMasterAnchorElement ] = useState<null | HTMLElement>(null)
  const [ otherMenu, setOtherMenu ] = useState<OtherKey | null>(null)
  const [ otherAnchorElement, setOtherAnchorElement ] = useState<null | HTMLElement>(null)

  const handleStockTabClick = (event: MouseEvent<HTMLElement>) => {
    setStockAnchorElement(event.currentTarget)
  }
  const handleMasterTabClick = (event: MouseEvent<HTMLElement>) => {
    setMasterAnchorElement(event.currentTarget)
  }
  const handleOtherTabClick = (event: MouseEvent<HTMLElement>) => {
    setOtherAnchorElement(event.currentTarget)
  }

  const stockComponents: Record<StockKey, ReactNode> = {
    '在庫一覧': <Stocks />,
    '入庫': <Inbound />,
    '出庫': <Outbound />,
    '入庫履歴': <InboundHistories />,
    '出庫履歴': <OutboundHistories />,
  }
  const masterComponents: Record<MasterKey, ReactNode> = {
    '資材': <Materials />,
    '製造メーカー': <Manufacturers />,
    '配送先': <DeliverySites />,
    'ユーザー': <Users />,
    'ロール': <Roles />,
  }
  const otherComponents: Record<OtherKey, ReactNode> = {
    'ライセンス表示': <Licenses />,
    'アプリ機能説明': <Overview />,
  }

  const stockMenuItems: StockKey[] = role === 'STAFF'
    ? [ '在庫一覧', '入庫', '出庫' ]
    : [ '在庫一覧', '入庫', '出庫', '入庫履歴', '出庫履歴' ]

  const masterMenuItems: MasterKey[] = role === 'SYSTEM'
    ? [ '資材', '製造メーカー', '配送先', 'ユーザー', 'ロール' ]
    : role === 'ADMIN'
      ? [ '資材', '製造メーカー', '配送先'] 
      : []

  const otherMenuItems: OtherKey[] = [ 'ライセンス表示', 'アプリ機能説明' ]

  const handleTabChange = (event: SyntheticEvent, newTabIndex: number) => {
    setTabIndex(newTabIndex)
    setStockAnchorElement(null)
    setMasterAnchorElement(null)
    setOtherAnchorElement(null)
  }

  const handleStockMenuSelect = (menu: StockKey) => {
    setStockMenu(menu)
    setTabIndex(0)
    setStockAnchorElement(null)
  }
  const handleMasterMenuSelect = (menu: MasterKey) => {
    setMasterMenu(menu)
    setTabIndex(1)
    setMasterAnchorElement(null)
  }
  const handleOtherMenuSelect = (menu: OtherKey) => {
    setOtherMenu(menu)
    setTabIndex(2)
    setOtherAnchorElement(null)
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={ tabIndex } onChange={ handleTabChange } variant='scrollable' scrollButtons='auto' textColor='secondary' indicatorColor='secondary' aria-label='basic tabs example'>
          <Tab label='在庫管理' { ...a11yProps(0) } onClick={ handleStockTabClick } />
          { role !== 'STAFF' && (
            <Tab label='マスタ' { ...a11yProps(1) } onClick={ handleMasterTabClick } />
          )}
          <Tab label='その他' { ...a11yProps(role !== 'STAFF' ? 2 : 1) } onClick={ handleOtherTabClick } />
        </Tabs>
      </Box>
      <Menu
        anchorEl={ stockAnchorElement }
        open={ Boolean(stockAnchorElement) }
        onClose={ () => setStockAnchorElement(null) }
      >
        { stockMenuItems.map(menu => (
          <MenuItem key={ menu } onClick={ () => handleStockMenuSelect(menu) }>{ menu }</MenuItem>
        )) }
      </Menu>
      <Menu
        anchorEl={ masterAnchorElement }
        open={ Boolean(masterAnchorElement) }
        onClose={ () => setMasterAnchorElement(null) }
      >
        { masterMenuItems.map(menu => (
          <MenuItem key={ menu } onClick={ () => handleMasterMenuSelect(menu) }>{ menu }</MenuItem>
        )) }
      </Menu>
      <Menu
        anchorEl={ otherAnchorElement }
        open={ Boolean(otherAnchorElement) }
        onClose={ () => setOtherAnchorElement(null) }
      >
        { otherMenuItems.map(menu => (
          <MenuItem key={ menu } onClick={ () => handleOtherMenuSelect(menu) }>{ menu }</MenuItem>
        )) }
      </Menu>
      <CustomTabPanel value={ tabIndex } index={ 0 }>
        { stockMenu ? stockComponents[ stockMenu ] : <div>在庫メニューを選択してください</div> }
      </CustomTabPanel>
      <CustomTabPanel value={ tabIndex } index={ 1 }>
        { masterMenu ? masterComponents[ masterMenu ] : <div>マスタを選択してください</div> }
      </CustomTabPanel>
      <CustomTabPanel value={ tabIndex } index={ 2 }>
        { otherMenu ? otherComponents[ otherMenu ] : <div>その他メニューを選択してください</div> }
      </CustomTabPanel>
    </Box>
  )
}

export default Contents