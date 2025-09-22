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
import OutboundHistories from '@/components/OutboundHistories'
import Roles from '@/components/Roles'
import Stocks from '@/components/Stocks'
import Users from '@/components/Users'

interface TabPanelProps {
  children?: ReactNode;
  index: number;
  value: number;
}

type StockKey = '在庫一覧' | '入庫' | '出庫' | '入庫履歴' | '出庫履歴'
type MasterKey = '品目' | '製造メーカー' | '配送先' | 'ユーザー' | 'ロール' 

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
  const [ tabIndex, setTabIndex ] = useState(0);
  const [ stockMenu, setStockMenu ] = useState<StockKey | null>(null)
  const [ masterMenu, setMasterMenu ] = useState<MasterKey | null>(null)
  const [ stockAnchorElement, setStockAnchorElement ] = useState<null | HTMLElement>(null)
  const [ masterAnchorElement, setMasterAnchorElement ] = useState<null | HTMLElement>(null)
  const handleStockTabClick = (event: MouseEvent<HTMLElement>) => {
    setStockAnchorElement(event.currentTarget)
  }
  const handleMasterTabClick = (event: MouseEvent<HTMLElement>) => {
    setMasterAnchorElement(event.currentTarget)
  }
  const stockComponents: Record<StockKey, ReactNode> = {
    '在庫一覧': <Stocks />,
    '入庫': <Inbound />,
    '出庫': <>TODO: 出庫</>,
    '入庫履歴': <InboundHistories />,
    '出庫履歴': <OutboundHistories />,
  }
  const masterComponents: Record<MasterKey, ReactNode> = {
    '品目': <Materials />,
    '製造メーカー': <Manufacturers />,
    '配送先': <DeliverySites />,
    'ユーザー': <Users />,
    'ロール': <Roles />,
  }
  const handleTabChange = (event: SyntheticEvent, newTabIndex: number) => {
    if (newTabIndex === 0) {
      setStockAnchorElement(event.currentTarget as HTMLElement)
    } else if (newTabIndex === 1) {
      setMasterAnchorElement(event.currentTarget as HTMLElement)
    } else {
      setTabIndex(newTabIndex)
      setStockMenu(null)
      setMasterMenu(null)
    }
  }
  const handleStockMenuSelect = (menu: StockKey) => {
    setStockMenu(menu)
    setTabIndex(0)
    setStockAnchorElement(null)
  }
  const handleMenuSelect = (menu: MasterKey) => {
    setMasterMenu(menu)
    setTabIndex(1)
    setMasterAnchorElement(null)
  }
  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={ tabIndex } onChange={ handleTabChange } variant='scrollable' scrollButtons='auto' textColor='secondary' indicatorColor='secondary' aria-label='basic tabs example'>
          <Tab label='在庫管理' { ...a11yProps(0) } onClick={ handleStockTabClick } />
          <Tab label='マスタ' { ...a11yProps(1) } onClick={ handleMasterTabClick } />
          <Tab label='その他' { ...a11yProps(2) } />
        </Tabs>
      </Box>
      <Menu
        anchorEl={ stockAnchorElement }
        open={ Boolean(stockAnchorElement) }
        onClose={ () => setStockAnchorElement(null) }
      >
        <MenuItem onClick={ () => handleStockMenuSelect('在庫一覧') }>在庫一覧</MenuItem>
        <MenuItem onClick={ () => handleStockMenuSelect('入庫') }>入庫</MenuItem>
        <MenuItem onClick={ () => handleStockMenuSelect('出庫') }>出庫</MenuItem>
        <MenuItem onClick={ () => handleStockMenuSelect('入庫履歴') }>入庫履歴</MenuItem>
        <MenuItem onClick={ () => handleStockMenuSelect('出庫履歴') }>出庫履歴</MenuItem>
      </Menu>
      <Menu
        anchorEl={ masterAnchorElement }
        open={ Boolean(masterAnchorElement) }
        onClose={ () => setMasterAnchorElement(null) }
      >
        <MenuItem onClick={ () => handleMenuSelect('品目') }>品目</MenuItem>
        <MenuItem onClick={ () => handleMenuSelect('製造メーカー') }>製造メーカー</MenuItem>
        <MenuItem onClick={ () => handleMenuSelect('配送先') }>配送先</MenuItem>
        <MenuItem onClick={ () => handleMenuSelect('ユーザー') }>ユーザー</MenuItem>
        <MenuItem onClick={ () => handleMenuSelect('ロール') }>ロール</MenuItem>
      </Menu>
      <CustomTabPanel value={ tabIndex } index={ 0 }>
        { !stockMenu && <div>在庫メニューを選択してください</div> }
        { stockMenu && stockComponents[ stockMenu ] }
      </CustomTabPanel>
      <CustomTabPanel value={tabIndex} index={1}>
        { !masterMenu && <div>マスタを選択してください</div> }
        { masterMenu && masterComponents[ masterMenu ] }
      </CustomTabPanel>
      <CustomTabPanel value={ tabIndex } index={ 2 }>
        <Licenses />
      </CustomTabPanel>
    </Box>
  )
}

export default Contents