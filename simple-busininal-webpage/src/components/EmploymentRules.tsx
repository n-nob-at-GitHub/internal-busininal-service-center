'use client'
import { useState } from 'react'
import Image, { StaticImageData } from 'next/image'
import {
  ImageList,
  ImageListItem,
  styled,
  Typography,
} from '@mui/material'
import MuiAccordion, { AccordionProps } from '@mui/material/Accordion'
import MuiAccordionSummary, {
  AccordionSummaryProps,
  accordionSummaryClasses,
} from '@mui/material/AccordionSummary'
import MuiAccordionDetails from '@mui/material/AccordionDetails'
import ArrowForwardIosSharpIcon from '@mui/icons-material/ArrowForwardIosSharp'
import image_bs_1 from '@/images/bs-wage-regulations/bs-1.png'
import image_bs_2 from '@/images/bs-wage-regulations/bs-2.png'
import image_bs_3 from '@/images/bs-wage-regulations/bs-3.png'
import image_bs_4 from '@/images/bs-wage-regulations/bs-4.png'
import image_bs_5 from '@/images/bs-wage-regulations/bs-5.png'
import image_bs_6 from '@/images/bs-wage-regulations/bs-6.png'
import image_bs_7 from '@/images/bs-wage-regulations/bs-7.png'
import image_caregiving_1 from '@/images/caregiving-and-childcare-leave-regulations/caregiving-1.png'
import image_caregiving_2 from '@/images/caregiving-and-childcare-leave-regulations/caregiving-2.png'
import image_caregiving_3 from '@/images/caregiving-and-childcare-leave-regulations/caregiving-3.png'
import image_caregiving_4 from '@/images/caregiving-and-childcare-leave-regulations/caregiving-4.png'
import image_caregiving_5 from '@/images/caregiving-and-childcare-leave-regulations/caregiving-5.png'
import image_caregiving_6 from '@/images/caregiving-and-childcare-leave-regulations/caregiving-6.png'
import image_contracted_1 from '@/images/employment-rules-for-contracted-employees/contracted-1.png'
import image_contracted_2 from '@/images/employment-rules-for-contracted-employees/contracted-2.png'
import image_contracted_3 from '@/images/employment-rules-for-contracted-employees/contracted-3.png'
import image_contracted_4 from '@/images/employment-rules-for-contracted-employees/contracted-4.png'
import image_general_01 from '@/images/general-employee-work-rules/general-01.png'
import image_general_02 from '@/images/general-employee-work-rules/general-02.png'
import image_general_03 from '@/images/general-employee-work-rules/general-03.png'
import image_general_04 from '@/images/general-employee-work-rules/general-04.png'
import image_general_05 from '@/images/general-employee-work-rules/general-05.png'
import image_general_06 from '@/images/general-employee-work-rules/general-06.png'
import image_general_07 from '@/images/general-employee-work-rules/general-07.png'
import image_general_08 from '@/images/general-employee-work-rules/general-08.png'
import image_general_09 from '@/images/general-employee-work-rules/general-09.png'
import image_general_10 from '@/images/general-employee-work-rules/general-10.png'
import image_general_11 from '@/images/general-employee-work-rules/general-11.png'
import image_general_12 from '@/images/general-employee-work-rules/general-12.png'
import image_general_13 from '@/images/general-employee-work-rules/general-13.png'
import image_general_14 from '@/images/general-employee-work-rules/general-14.png'
import image_general_15 from '@/images/general-employee-work-rules/general-15.png'
import image_general_16 from '@/images/general-employee-work-rules/general-16.png'
import image_general_17 from '@/images/general-employee-work-rules/general-17.png'
import image_general_18 from '@/images/general-employee-work-rules/general-18.png'
import image_general_19 from '@/images/general-employee-work-rules/general-19.png'
import image_general_20 from '@/images/general-employee-work-rules/general-20.png'
import image_general_21 from '@/images/general-employee-work-rules/general-21.png'
import image_general_22 from '@/images/general-employee-work-rules/general-22.png'
import image_general_23 from '@/images/general-employee-work-rules/general-23.png'
import image_power_1 from '@/images/power-harassment-prevention-regulations/power-1.png'
import image_power_2 from '@/images/power-harassment-prevention-regulations/power-2.png'
import image_power_3 from '@/images/power-harassment-prevention-regulations/power-3.png'
import image_sexual_1 from '@/images/sexual-harassment-prevention-regulations/sexual-1.png'
import image_sexual_2 from '@/images/sexual-harassment-prevention-regulations/sexual-2.png'
import image_time_01 from '@/images/time-employment-rules-for-members/time-01.png'
import image_time_02 from '@/images/time-employment-rules-for-members/time-02.png'
import image_time_03 from '@/images/time-employment-rules-for-members/time-03.png'
import image_time_04 from '@/images/time-employment-rules-for-members/time-04.png'
import image_time_05 from '@/images/time-employment-rules-for-members/time-05.png'
import image_time_06 from '@/images/time-employment-rules-for-members/time-06.png'
import image_time_07 from '@/images/time-employment-rules-for-members/time-07.png'
import image_time_08 from '@/images/time-employment-rules-for-members/time-08.png'
import image_time_09 from '@/images/time-employment-rules-for-members/time-09.png'
import image_time_10 from '@/images/time-employment-rules-for-members/time-10.png'
import image_time_11 from '@/images/time-employment-rules-for-members/time-11.png'
import image_time_12 from '@/images/time-employment-rules-for-members/time-12.png'
import image_time_13 from '@/images/time-employment-rules-for-members/time-13.png'

type ImageItem = {
  img: StaticImageData
  title?: string
  cols?: number
  rows?: number
}

// https://mui.com/material-ui/react-accordion/
const Accordion = styled((props: AccordionProps) => (
  <MuiAccordion disableGutters elevation={ 0 } square { ...props } />
))(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  '&:not(:last-child)': {
    borderBottom: 0,
  },
  '&::before': {
    display: 'none',
  },
}))

const AccordionSummary = styled((props: AccordionSummaryProps) => (
  <MuiAccordionSummary
    expandIcon={ <ArrowForwardIosSharpIcon sx={{ fontSize: '0.9rem' }} /> }
    { ...props }
  />
))(({ theme }) => ({
  backgroundColor: 'rgba(0, 0, 0, .03)',
  flexDirection: 'row-reverse',
  [`& .${ accordionSummaryClasses.expandIconWrapper }.${ accordionSummaryClasses.expanded }`]:
    {
      transform: 'rotate(90deg)',
    },
  [`& .${ accordionSummaryClasses.content }`]: {
    marginLeft: theme.spacing(1),
  },
  ...theme.applyStyles('dark', {
    backgroundColor: 'rgba(255, 255, 255, .05)',
  }),
}))

const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
  padding: theme.spacing(2),
  borderTop: '1px solid rgba(0, 0, 0, .125)',
}))

const makeImageListContent = (data: ImageItem[], maxCols = 1) => {
  return <ImageList 
    cols={ maxCols }
    sx={{
      '& .MuiImageListItem-root': {
        position: 'relative',
      },
    }}>
    { data.map((item, index) => (
      <ImageListItem 
        key={ index }
        cols={ item.cols ?? 3 }
        rows={ item.rows ?? 4 }
        sx={{
          aspectRatio: `${ item.cols ?? 3 } / ${ item.rows ?? 4 }`,
          border: 1, 
          borderColor: 'grey.200', 
          p: 2,
          position: 'relative',
        }}>
        <Image
          src={ item.img.src }
          alt={ item.title ?? '' }
          loading='lazy'
          fill
          style={{ objectFit: 'cover' }}
        />
      </ImageListItem>
    ))}
  </ImageList>;
}

const makeAccordionContent = (
  key: string, 
  title: string, 
  data: ImageItem[], 
  maxCols = 1, 
  expanded: string | boolean, 
  handleChange: (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => void
) => {
  return <Accordion expanded={ expanded === key } onChange={ handleChange(key) }>
    <AccordionSummary aria-controls={ `${ key }-content` } id={`${ key }-header`}>
      <Typography component='span'>{ title }</Typography>
    </AccordionSummary>
    <AccordionDetails>
      { makeImageListContent(data, maxCols) }
    </AccordionDetails>
  </Accordion>;
}

const WebBasedEmploymentRules = () => {
  const [ expanded, setExpanded ] = useState<string | false>('')
  const handleChange =
  (panel: string) => (event: React.SyntheticEvent, newExpanded: boolean) => {
    setExpanded(newExpanded ? panel : false);
  }

  const bsWageRegulationsData = [
    {
      img: image_bs_1,
    },
    {
      img: image_bs_2,
    },
    {
      img: image_bs_3,
    },
    {
      img: image_bs_4,
    },
    {
      img: image_bs_5,
    },
    {
      img: image_bs_6,
    },
    {
      img: image_bs_7,
    },
  ];
  const caregivingAndChildcareLeaveRegulationsData = [
    {
      img: image_caregiving_1,
    },
    {
      img: image_caregiving_2,
    },
    {
      img: image_caregiving_3,
    },
    {
      img: image_caregiving_4,
    },
    {
      img: image_caregiving_5,
    },
    {
      img: image_caregiving_6,
    },
  ];
  const employmentRulesForContractedEmployeesData = [
    {
      img: image_contracted_1,
    },
    {
      img: image_contracted_2,
    },
    {
      img: image_contracted_3,
    },
    {
      img: image_contracted_4,
    },
  ];
  const generalEmployeeWorkRulesData = [
    {
      img: image_general_01,
    },
    {
      img: image_general_02,
    },
    {
      img: image_general_03,
    },
    {
      img: image_general_04,
    },
    {
      img: image_general_05,
    },
    {
      img: image_general_06,
    },
    {
      img: image_general_07,
    },
    {
      img: image_general_08,
    },
    {
      img: image_general_09,
    },
    {
      img: image_general_10,
    },
    {
      img: image_general_11,
    },
    {
      img: image_general_12,
    },
    {
      img: image_general_13,
    },
    {
      img: image_general_14,
    },
    {
      img: image_general_15,
    },
    {
      img: image_general_16,
    },
    {
      img: image_general_17,
    },
    {
      img: image_general_18,
    },
    {
      img: image_general_19,
    },
    {
      img: image_general_20,
    },
    {
      img: image_general_21,
    },
    {
      img: image_general_22,
    },
    {
      img: image_general_23,
    },
  ];
  const powerHarassmentPreventionRegulationsData = [
    {
      img: image_power_1,
    },
    {
      img: image_power_2,
    },
    {
      img: image_power_3,
    },
  ];
  const sexualHarassmentPreventionRegulationsData = [
    {
      img: image_sexual_1,
    },
    {
      img: image_sexual_2,
    },
  ];
  const timeEmploymentRulesForMembersData = [
    {
      img: image_time_01,
    },
    {
      img: image_time_02,
    },
    {
      img: image_time_03,
    },
    {
      img: image_time_04,
    },
    {
      img: image_time_05,
    },
    {
      img: image_time_06,
    },
    {
      img: image_time_07,
    },
    {
      img: image_time_08,
    },
    {
      img: image_time_09,
    },
    {
      img: image_time_10,
    },
    {
      img: image_time_11,
    },
    {
      img: image_time_12,
      cols: 4,
      rows: 3,
    },
    {
      img: image_time_13,
    },
  ];
  
  return (
    <>
      { makeAccordionContent('bs-wage-regulations', 'ＢＳ賃金規程（2025.6.1）', bsWageRegulationsData, 3, expanded, handleChange) }
      { makeAccordionContent('caregiving-and-childcare-leave-regulations', '介護育児休業規則（2025.9.15）【仮】', caregivingAndChildcareLeaveRegulationsData, 3, expanded, handleChange) }
      { makeAccordionContent('employment-rules-for-contracted-employees', '嘱託社員就業規則（2024.09.20）', employmentRulesForContractedEmployeesData, 3, expanded, handleChange) }
      { makeAccordionContent('general-employee-work-rules', '一般社員就業規則（2025.6.1）B', generalEmployeeWorkRulesData, 3, expanded, handleChange) }
      { makeAccordionContent('power-harassment-prevention-regulations', 'パワーハラスメント防止規程（2012.10.1）', powerHarassmentPreventionRegulationsData, 3, expanded, handleChange) }
      { makeAccordionContent('sexual-harassment-prevention-regulations', 'セクシャルハラスメント防止規程（2012.10.1）', sexualHarassmentPreventionRegulationsData, 3, expanded, handleChange) }
      { makeAccordionContent('time-employment-rules-for-members', '時間給社員就業規則 (2024.9.30)', timeEmploymentRulesForMembersData, 3, expanded, handleChange) }
    </>
  )
}

export default WebBasedEmploymentRules