'use client'
import React from 'react'
import {
  Box,
  Tab,
  Tabs,
} from '@mui/material'
import BuddhistAltars from '@/components/BuddhistAltars'
import Bells from '@/components/Bells'
import MemorialFlowers from '@/components/MemorialFlowers'
import Rosaries from '@/components/Rosaries'
import PhotoFrames from '@/components/PhotoFrames'
import OtherBuddhistAltarImplements from '@/components/OtherBuddhistAltarImplements'

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

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
  const [ tabIndex, setTabIndex ] = React.useState(0);
  const handleTabChange = (event: React.SyntheticEvent, newTabIndex: number) => {
    setTabIndex(newTabIndex);
  };
  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={ tabIndex } onChange={ handleTabChange } variant='scrollable' scrollButtons='auto' aria-label='basic tabs example'>
          <Tab label='念珠' { ...a11yProps(0) } />
          <Tab label='仏壇' { ...a11yProps(1) } />
          <Tab label='御鈴' { ...a11yProps(2) } />
          <Tab label='メモリアルフラワー' { ...a11yProps(3) } />
          <Tab label='フォトフレーム' { ...a11yProps(4) } />
          <Tab label='その他の仏具' { ...a11yProps(5) } />
        </Tabs>
      </Box>
      <CustomTabPanel value={ tabIndex } index={ 0 }>
        <Rosaries />
      </CustomTabPanel>
      <CustomTabPanel value={ tabIndex } index={ 1 }>
        <BuddhistAltars />
      </CustomTabPanel>
      <CustomTabPanel value={ tabIndex } index={ 2 }>
        <Bells />
      </CustomTabPanel>
      <CustomTabPanel value={ tabIndex } index={ 3 }>
        <MemorialFlowers />
      </CustomTabPanel>
      <CustomTabPanel value={ tabIndex } index={ 4 }>
        <PhotoFrames />
      </CustomTabPanel>
      <CustomTabPanel value={ tabIndex } index={ 5 }>
        <OtherBuddhistAltarImplements />
      </CustomTabPanel>
    </Box>
  )
}

export default Contents