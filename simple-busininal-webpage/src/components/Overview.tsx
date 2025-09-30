import { ReactNode, SyntheticEvent, useState } from 'react';
import { styled } from '@mui/material/styles';
import ArrowForwardIosSharpIcon from '@mui/icons-material/ArrowForwardIosSharp';
import MuiAccordion from '@mui/material/Accordion';
import MuiAccordionSummary from '@mui/material/AccordionSummary';
import MuiAccordionDetails from '@mui/material/AccordionDetails';
import {
  AccordionProps,
  AccordionSummaryProps,
  accordionSummaryClasses,
  Box,
  List,
  ListItem,
  Typography
} from '@mui/material';
import DataSaverOnOutlinedIcon from '@mui/icons-material/DataSaverOnOutlined'

const Accordion = styled((props: AccordionProps) => (
  <MuiAccordion disableGutters elevation={ 0 } square { ...props } />
))(({ theme }) => ({
  border: `1px solid ${ theme.palette.divider }`,
  '&:not(:last-child)': {
    borderBottom: 0,
  },
  '&::before': {
    display: 'none',
  },
}));

const AccordionSummary = styled((props: AccordionSummaryProps) => (
  <MuiAccordionSummary
    expandIcon={<ArrowForwardIosSharpIcon sx={{ fontSize: '0.9rem' }} />}
    {...props}
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
}));

const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
  padding: theme.spacing(2),
  borderTop: '1px solid rgba(0, 0, 0, .125)',
}));

const StepItem = ({ children, icon }: { children: ReactNode; icon?: ReactNode }) => (
  <ListItem sx={{ display: 'list-item' }}>
    { icon ? (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        { children } { icon }
      </Box>
    ) : (
      children
    )}
  </ListItem>
);

const sections = [
  {
    key: 'permission',
    title: '権限',
    content: (
      <Typography>SYSTEM, ADMIN, STAFF の３種類</Typography>
    ),
  },
  {
    key: 'inbound',
    title: '入庫',
    steps: [
      '在庫管理 → 入庫 から 入庫対象品を表示',
      '各資材の入庫数を入力',
      <>
        右上のアイコン <DataSaverOnOutlinedIcon /> を押下
      </>,
      '入庫確認ダイアログで、OKボタンを押下',
    ],
  },
  {
    key: 'inboundCancel',
    title: '入庫取消',
    steps: [
      '在庫管理 → 入庫履歴 から 入庫履歴を表示',
      '該当するNo.の入庫で、無効に切り替える',
    ],
  },
  {
    key: 'outbound',
    title: '出庫',
    steps: [
      '在庫管理 → 出庫 から 出庫対象品を表示',
      '配送先を選択',
      '各資材の出庫数を入力',
      <>
        右上のアイコン <DataSaverOnOutlinedIcon /> を押下
      </>,
      '出庫確認ダイアログで、OKボタンを押下',
    ],
  },
  {
    key: 'outboundCancel',
    title: '出庫取消',
    steps: [
      '在庫管理 → 出庫履歴 から 出庫履歴を表示',
      '該当するNo.の出庫で、無効に切り替える',
    ],
  },
];

const Overview = () => {
  const [ expanded, setExpanded ] = useState<string | false>(false)

  const handleChange =
    (panel: string) => (_: SyntheticEvent, newExpanded: boolean) => {
      setExpanded(newExpanded ? panel : false);
    };

  return (
    <div>
      {sections.map(({ key, title, content, steps }) => (
        <Accordion
          key={ key }
          expanded={ expanded === key }
          onChange={ handleChange(key) }
        >
          <AccordionSummary aria-controls={`${ key }-content`} id={`${ key }-header`}>
            <Typography component="span">{ title }</Typography>
          </AccordionSummary>
          <AccordionDetails>
            { content }
            { steps && (
              <List sx={{ listStyle: 'decimal', pl: 4 }}>
                { steps.map((step, i) => (
                  <StepItem key={ i }>
                    { step }
                  </StepItem>
                ))}
              </List>
            )}
          </AccordionDetails>
        </Accordion>
      ))}
    </div>
  );
}

export default Overview
