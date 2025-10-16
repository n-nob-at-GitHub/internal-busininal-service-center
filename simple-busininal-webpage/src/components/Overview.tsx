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
  Button,
  Card,
  CardHeader,
  CardContent,
  List,
  ListItem,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
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
    key: 'overview',
    title: '概要',
    content: (
      <>
        <Card sx={{ mt: 0 }}>
          <CardHeader
            title='ユーザー'
            sx={{
              bgcolor: '#e3f2fd',
              borderBottom: '1px solid #e0e0e0',
              py: 1
            }}
          />
          <CardContent>
            <Typography>アプリで利用可能な機能は、以下のユーザーの権限（ロール）ごとに異なる</Typography>
            <ul>
              <li>SYSTEM</li>
              <li>ADMIN</li>
              <li>STAFF</li>
            </ul>
          </CardContent>
        </Card>
        <Card sx={{ mt: 2 }}>
          <CardHeader
            title='マスタ'
            sx={{
              bgcolor: '#e3f2fd',
              borderBottom: '1px solid #e0e0e0',
              py: 1
            }}
          />
          <CardContent sx={{ py: 0 }}>
            <Table size='small' sx={{ mt: 1, maxWidth: 600 }}>
              <TableHead>
                <TableRow>
                  <TableCell>区分</TableCell>
                  <TableCell align='center'>SYSTEM</TableCell>
                  <TableCell align='center'>ADMIN</TableCell>
                  <TableCell align='center'>STAFF</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>資材</TableCell>
                  <TableCell align='center'>〇</TableCell>
                  <TableCell align='center'>〇</TableCell>
                  <TableCell align='center'>✕</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>製造メーカー</TableCell>
                  <TableCell align='center'>〇</TableCell>
                  <TableCell align='center'>〇</TableCell>
                  <TableCell align='center'>✕</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>配送先</TableCell>
                  <TableCell align='center'>〇</TableCell>
                  <TableCell align='center'>〇</TableCell>
                  <TableCell align='center'>✕</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>ユーザー</TableCell>
                  <TableCell align='center'>〇</TableCell>
                  <TableCell align='center'>✕</TableCell>
                  <TableCell align='center'>✕</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>ロール</TableCell>
                  <TableCell align='center'>〇</TableCell>
                  <TableCell align='center'>✕</TableCell>
                  <TableCell align='center'>✕</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card sx={{ mt: 2 }}>
          <CardHeader
            title='在庫管理'
            sx={{
              bgcolor: '#e3f2fd',
              borderBottom: '1px solid #e0e0e0',
              py: 1
            }}
          />
          <CardContent sx={{ py: 0 }}>
            <Table size='small' sx={{ mt: 1, maxWidth: 600 }}>
              <TableHead>
                <TableRow>
                  <TableCell>区分</TableCell>
                  <TableCell align='center'>SYSTEM</TableCell>
                  <TableCell align='center'>ADMIN</TableCell>
                  <TableCell align='center'>STAFF</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>在庫一覧</TableCell>
                  <TableCell align='center'>〇</TableCell>
                  <TableCell align='center'>〇</TableCell>
                  <TableCell align='center'>〇</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>入庫</TableCell>
                  <TableCell align='center'>〇</TableCell>
                  <TableCell align='center'>〇</TableCell>
                  <TableCell align='center'>〇</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>出庫</TableCell>
                  <TableCell align='center'>〇</TableCell>
                  <TableCell align='center'>〇</TableCell>
                  <TableCell align='center'>〇</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>入庫履歴</TableCell>
                  <TableCell align='center'>〇</TableCell>
                  <TableCell align='center'>〇</TableCell>
                  <TableCell align='center'>✕</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>出庫履歴</TableCell>
                  <TableCell align='center'>〇</TableCell>
                  <TableCell align='center'>〇</TableCell>
                  <TableCell align='center'>✕</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </>
    ),
  },
  {
    key: 'authentication',
    title: '認証',
    content: (
      <>
        <Card sx={{ mt: 2 }}>
          <CardHeader
            title='認証情報'
            sx={{
              bgcolor: '#e3f2fd',
              borderBottom: '1px solid #e0e0e0',
              py: 1
            }}
          />
          <CardContent sx={{ py: 0 }}>
            <Table size='small' sx={{ mt: 1 }}>
              <TableHead>
                <TableRow>
                  <TableCell>項目</TableCell>
                  <TableCell align='center'>内容</TableCell>
                  <TableCell align='center'>備考</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>ログインURL</TableCell>
                  <TableCell align='left'>https://d2slubzovll4xp.cloudfront.net/</TableCell>
                  <TableCell align='left'>Amazon Cognito Hosted UIを利用</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>初期パスワード</TableCell>
                  <TableCell align='left'>InitPass123!</TableCell>
                  <TableCell align='left'>ユーザー登録後に必要</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>パスワードリセット</TableCell>
                  <TableCell align='left'>Forgot your password? のリンクから、誘導に従って進む</TableCell>
                  <TableCell align='left'>①初期パスワード変更済みであること、②メールアドレスが使えること、の両方が必要</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Access Tokenの有効期限</TableCell>
                  <TableCell align='left'>60分</TableCell>
                  <TableCell align='left'>有効期限過ぎたらログイン画面に遷移</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>F5リロード</TableCell>
                  <TableCell align='left'>Authentication error: ... のような表示が出たら <Button variant='outlined'>Retry</Button> ボタンを押下</TableCell>
                  <TableCell align='left'>ログイン画面、または、トップ画面に遷移</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </>
    ),
  },
  {
    key: 'inbound-outbound',
    title: '入出庫',
    content: (
      <>
        <Card sx={{ mt: 2 }}>
          <CardHeader
            title='入庫'
            sx={{
              bgcolor: '#e3f2fd',
              borderBottom: '1px solid #e0e0e0',
              py: 1
            }}
          />
          <CardContent sx={{ py: 1 }}>
            <List sx={{ listStyle: 'decimal', pl: 4, pb: 0 }}>
              {[
                '在庫管理タブ → 入庫 から 入庫対象品を表示',
                '各資材の入庫数を入力',
                <>右上のアイコン <DataSaverOnOutlinedIcon sx={{ verticalAlign: 'middle' }} /> を押下</>,
                '入庫確認ダイアログで、OKボタンを押下',
              ].map((step, i) => (
                <StepItem key={ i }>
                  { step }
                </StepItem>
              ))}
            </List>
          </CardContent>
        </Card>
        <Card sx={{ mt: 2 }}>
          <CardHeader
            title='入庫取消'
            sx={{
              bgcolor: '#e3f2fd',
              borderBottom: '1px solid #e0e0e0',
              py: 1
            }}
          />
          <CardContent sx={{ py: 1 }}>
            <List sx={{ listStyle: 'decimal', pl: 4, pb: 0 }}>
              {[
                '在庫管理タブ → 入庫履歴 から 入庫履歴を表示',
                '該当するNo.の入庫で、無効に切り替える',
              ].map((step, i) => (
                <StepItem key={ i }>
                  { step }
                </StepItem>
              ))}
            </List>
          </CardContent>
        </Card>
        <Card sx={{ mt: 2 }}>
          <CardHeader
            title='出庫'
            sx={{
              bgcolor: '#e3f2fd',
              borderBottom: '1px solid #e0e0e0',
              py: 1
            }}
          />
          <CardContent sx={{ py: 1 }}>
            <List sx={{ listStyle: 'decimal', pl: 4, pb: 0 }}>
              {[
                '在庫管理タブ → 出庫 から 出庫対象品を表示',
                '配送先を選択',
                '各資材の出庫数を入力',
                <>右上のアイコン <DataSaverOnOutlinedIcon sx={{ verticalAlign: 'middle' }} /> を押下</>,
                '出庫確認ダイアログで、OKボタンを押下',
              ].map((step, i) => (
                <StepItem key={ i }>
                  { step }
                </StepItem>
              ))}
            </List>
          </CardContent>
        </Card>
        <Card sx={{ mt: 2 }}>
          <CardHeader
            title='出庫取消'
            sx={{
              bgcolor: '#e3f2fd',
              borderBottom: '1px solid #e0e0e0',
              py: 1
            }}
          />
          <CardContent sx={{ py: 1 }}>
            <List sx={{ listStyle: 'decimal', pl: 4, pb: 0 }}>
              {[
                '在庫管理タブ → 出庫履歴 から 出庫履歴を表示',
                '該当するNo.の出庫で、無効に切り替える',
              ].map((step, i) => (
                <StepItem key={ i }>
                  { step }
                </StepItem>
              ))}
            </List>
          </CardContent>
        </Card>
      </>
    ),
  },
  {
    key: 'other',
    title: 'その他',
    content: (
      <>
        <Card sx={{ mt: 2 }}>
          <CardHeader
            title='制約事項'
            sx={{
              bgcolor: '#ffe6eb',
              borderBottom: '1px solid #e0e0e0',
              py: 1
            }}
          />
          <CardContent sx={{ py: 0 }}>
            <Table size='small' sx={{ mt: 1 }}>
              <TableHead>
                <TableRow>
                  <TableCell>項目</TableCell>
                  <TableCell align='center'>内容</TableCell>
                  <TableCell align='center'>備考</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>ログアウト</TableCell>
                  <TableCell align='left'>本アプリでは明示的なログアウトの導線は無し、Access Tokenの有効期限を過ぎたらログアウトと見做す</TableCell>
                  <TableCell align='left'>Amazon Cognito（認証基盤）の仕様に従うため</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>入出庫金額の不正確性</TableCell>
                  <TableCell align='left'>例えば、12個で998円のような資材の入出庫は、正確な単価を設定できない（約83.167円）ため、金額部分が不正確になる</TableCell>
                  <TableCell align='left'>但し、資材を分割出庫せず、常に購入単位で出庫する運用であれば、この限りではない</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card sx={{ mt: 2 }}>
          <CardHeader
            title='QA'
            sx={{
              bgcolor: '#fff9c4',
              borderBottom: '1px solid #e0e0e0',
              py: 1
            }}
          />
          <CardContent sx={{ py: 0 }}>
            <Table size='small' sx={{ mt: 1 }}>
              <TableHead>
                <TableRow>
                  <TableCell>項目</TableCell>
                  <TableCell align='center'>内容</TableCell>
                  <TableCell align='center'>備考</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>複数ユーザーでの操作</TableCell>
                  <TableCell align='left'>ブラウザをシークレットモードで開き、本アプリにログイン</TableCell>
                  <TableCell align='left'>通常、想定しない使い方（システム管理者などが利用する可能性あり）</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>認証エラーが出た場合</TableCell>
                  <TableCell align='left'>例えば、Application error: a client-side exception has occurred while loading ... のようなエラーが出たらシステム管理者に報告</TableCell>
                  <TableCell align='left'></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </>
    ),
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
      { sections.map(({ key, title, content }) => (
        <Accordion
          key={ key }
          expanded={ expanded === key }
          onChange={ handleChange(key) }
        >
          <AccordionSummary aria-controls={`${ key }-content`} id={`${ key }-header`}>
            <Typography component='span'>{ title }</Typography>
          </AccordionSummary>
          <AccordionDetails>
            { content }
          </AccordionDetails>
        </Accordion>
      ))}
    </div>
  );
}

export default Overview
