'use client'
import React from 'react'
import {
  Box,
  Tab,
  Tabs,
} from '@mui/material'
import WebBasedEmploymentRules from '@/components/EmploymentRules'

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
          <Tab label='就業規則一覧' { ...a11yProps(0) } />
        </Tabs>
      </Box>
      <CustomTabPanel value={ tabIndex } index={ 0 }>
        <WebBasedEmploymentRules />
      </CustomTabPanel>
    </Box>
  )
}

export default Contents