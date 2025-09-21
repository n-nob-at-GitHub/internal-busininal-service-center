'use client'
import {
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
import Licenses from '@/components/Licenses'
import Roles from '@/components/Roles'
import Manufacturers from '@/components/Manufacturers'
import Users from '@/components/Users'
import Materials from '@/components/Materials'

interface TabPanelProps {
  children?: ReactNode;
  index: number;
  value: number;
}

type MasterKey = '品目' | '製造メーカー' | 'ユーザー' | 'ロール' 

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
  const [ masterMenu, setMasterMenu ] = useState<MasterKey | null>(null)
  const [ anchorElement, setAnchorElement ] = useState<null | HTMLElement>(null)
  const handleMasterTabClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElement(event.currentTarget)
  }
  const masterComponents: Record<MasterKey, ReactNode> = {
    '品目': <Materials />,
    '製造メーカー': <Manufacturers />,
    'ユーザー': <Users />,
    'ロール': <Roles />,
  }
  const handleTabChange = (event: SyntheticEvent, newTabIndex: number) => {
    if (newTabIndex === 1) {
      setAnchorElement(event.currentTarget as HTMLElement)
    } else {
      setTabIndex(newTabIndex)
      setMasterMenu(null)
    }
  }
  const handleMenuSelect = (menu: MasterKey) => {
    setMasterMenu(menu)
    setTabIndex(1)
    setAnchorElement(null)
  }
  const handleMenuClose = () => {
    setAnchorElement(null)
  }
  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={ tabIndex } onChange={ handleTabChange } variant='scrollable' scrollButtons='auto' textColor='secondary' indicatorColor='secondary' aria-label='basic tabs example'>
          <Tab label='ダッシュボード' { ...a11yProps(0) } />
          <Tab label='マスタ' { ...a11yProps(1) } onClick={ handleMasterTabClick } />
          <Tab label='ライセンス' { ...a11yProps(2) } />
        </Tabs>
      </Box>
      <Menu
        anchorEl={ anchorElement }
        open={ Boolean(anchorElement) }
        onClose={ handleMenuClose }
      >
        <MenuItem onClick={() => handleMenuSelect('品目')}>品目</MenuItem>
        <MenuItem onClick={() => handleMenuSelect('製造メーカー')}>製造メーカー</MenuItem>
        <MenuItem onClick={() => handleMenuSelect('ユーザー')}>ユーザー</MenuItem>
        <MenuItem onClick={() => handleMenuSelect('ロール')}>ロール</MenuItem>
      </Menu>
      <CustomTabPanel value={ tabIndex } index={ 0 }>
        <div>Dashboard コンテンツ</div>
      </CustomTabPanel>
      <CustomTabPanel value={tabIndex} index={1}>
        { !masterMenu && <div>マスタを選択してください</div> }
        { masterMenu && masterComponents[masterMenu] }
      </CustomTabPanel>
      <CustomTabPanel value={ tabIndex } index={ 2 }>
        <Licenses />
      </CustomTabPanel>
    </Box>
  )
}

export default Contents