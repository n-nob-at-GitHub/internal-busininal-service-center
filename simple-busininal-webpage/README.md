## 開発環境

- プロジェクト.
  - [nvm](https://github.com/nvm-sh/nvm)
    - [nvm-windows](https://github.com/coreybutler/nvm-windows/releases) から（[nvm-setup.exe]ファイルを）download ＆ install
    ```
    > nvm -v
    > nvm ls
    > nvm list available
    ```
  - [Node.js](https://nodejs.org/docs/latest/api/) (※nvm use 22.4.1 で [C:\Program Files\nodejs] に リンクが生成された).
    ```
    > nvm install 20.14.0
    > nvm use 20.14.0
    > node -v
    > npm -v
    ```
    
  - [React](https://react.dev/reference/react)
    - 以下のコマンドで, プロジェクト作成すると, react (19), react-dom (19), @types/react (19), @types/react-dom (19) が導入されることを確認した（2025/09/17）
    - ブラウザでの表示は, http://localhost:3000/ で確認した（2025/09/17）
    ```
    > npx create-next-app@latest simple-busininal-webpage --ts
    > cd simple-busininal-webpage
    > npm run dev
    ```
    
  - [prisma](https://www.npmjs.com/package/prisma)
    ```
    > npm i -D prisma
    ```
    - 初期化
    ```
    > npx prisma init
    Fetching latest updates for this subcommand...
    
    ✔ Your Prisma schema was created at prisma/schema.prisma
      You can now open it in your favorite editor.
    
    warn You already have a .gitignore file. Don't forget to add `.env` in it to not commit any private information.
    
    Next steps:
    1. Run prisma dev to start a local Prisma Postgres server.
    2. Define models in the schema.prisma file.
    3. Run prisma migrate dev to migrate your local Prisma Postgres database.
    4. Tip: Explore how you can extend the ORM with scalable connection pooling, global caching, and a managed serverless Postgres database. Read: https://pris.ly/cli/beyond-orm
    
    More information in our documentation:
    https://pris.ly/d/getting-started
    ```
    - [.env]ファイル
    ```
    DATABASE_URL="file:./db_material_in_out.db"
    ```
    - [schema.prisma]ファイル
    ```
    // This is your Prisma schema file,
    // learn more about it in the docs: https://pris.ly/d/prisma-schema
    
    // Looking for ways to speed up your queries, or scale easily with your serverless or edge functions?
    // Try Prisma Accelerate: https://pris.ly/cli/accelerate-init
    
    generator client {
      provider = "prisma-client-js"
    }
    
    datasource db {
      provider = "sqlite"
      url      = env("DATABASE_URL")
    }
    
    model Role {
      id              Int              @id @default(autoincrement())
      name            String           @unique
      users           User[]
    }
    
    model User {
      id              Int              @id @default(autoincrement())
      roleId          Int              @map("role_id")
      mail            String           @unique
      role            Role             @relation(fields: [roleId], references: [id])
    }
    
    model Material {
      id              Int              @id @default(autoincrement())
      manufacturerId  Int              @map("manufacturer_id")
      code            String
      category        String
      price           Int              @default(0)
      quantity        Int              @default(0)
      unit            String
      name            String
      filePath        String?
      manufacturer    Manufacturer     @relation(fields: [manufacturerId], references: [id])
      stocks          Stock[]
    }
    
    model Manufacturer {
      id              Int              @id @default(autoincrement())
      name            String
      materials       Material[]
    }
    
    model Stock {
      id              Int              @id @default(autoincrement())
      materialId      Int              @map("material_id")
      totalQuantity   Int              @default(0)
      totalAmount     Int              @default(0)
      unit            String
      note            String?
      createdBy       String           @map("created_by")
      createdAt       DateTime         @map("created_at") @default(now())
      updatedBy       String           @map("updated_by")
      updatedAt       DateTime         @map("updated_at") @default(now())
      material        Material         @relation(fields: [materialId], references: [id])
      inbounds        Inbound[]
      outbounds       Outbound[]
    }
    
    model DeliverySite {
      id              Int              @id @default(autoincrement())
      name            String
      contact         String
      outbounds       Outbound[]
    }
    
    model Inbound {
      id              Int              @id @default(autoincrement())
      stockId         Int              @map("stock_id")
      quantity        Int              @default(0)
      amount          Int              @default(0)
      unitPrice       Int              @default(0)
      unit            String
      createdBy       String           @map("created_by")
      createdAt       DateTime         @map("created_at") @default(now())
      stock           Stock            @relation(fields: [stockId], references: [id])
    }
    
    model Outbound {
      id              Int              @id @default(autoincrement())
      stockId         Int              @map("stock_id")
      deliverySiteId  Int              @map("delivery_site_id")
      quantity        Int              @default(0)
      amount          Int              @default(0)
      unitPrice       Int              @default(0)
      unit            String
      createdBy       String           @map("created_by")
      createdAt       DateTime         @map("created_at") @default(now())
      stock           Stock            @relation(fields: [stockId], references: [id])
      deliverySite    DeliverySite     @relation(fields: [deliverySiteId], references: [id])
    }
    ```
    ```
    > npx prisma migrate dev --name init
    > npx prisma generate
    > npx prisma studio
    ```
    - Prisma Studioからのデータベース接続を確認 http://localhost:5555/
    ![035_npx prisma studio](https://private-user-images.githubusercontent.com/112742786/491672164-f9b76e5d-d048-431b-9b55-5d6f3175a291.png?jwt=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3NTgyOTYyOTksIm5iZiI6MTc1ODI5NTk5OSwicGF0aCI6Ii8xMTI3NDI3ODYvNDkxNjcyMTY0LWY5Yjc2ZTVkLWQwNDgtNDMxYi05YjU1LTVkNmYzMTc1YTI5MS5wbmc_WC1BbXotQWxnb3JpdGhtPUFXUzQtSE1BQy1TSEEyNTYmWC1BbXotQ3JlZGVudGlhbD1BS0lBVkNPRFlMU0E1M1BRSzRaQSUyRjIwMjUwOTE5JTJGdXMtZWFzdC0xJTJGczMlMkZhd3M0X3JlcXVlc3QmWC1BbXotRGF0ZT0yMDI1MDkxOVQxNTMzMTlaJlgtQW16LUV4cGlyZXM9MzAwJlgtQW16LVNpZ25hdHVyZT0wNjg2ODYxOWY5MDI1ZDExMzUzNjVmNzBhMmI5MjUxZmRjZDc4MWFlNTJmOGUwMTJkNmNhNGE0YWMxNTliZTg2JlgtQW16LVNpZ25lZEhlYWRlcnM9aG9zdCJ9.qC4UulSLGe6EbwFvAqGqFWjVxfX6xQqoi78QFKZFeGE)
    
  - [axios](https://www.npmjs.com/package/axios)
    - データベースの情報を, API経由で取得する方針
    ```
    > npm i axios
    ```
    
  - [Export to CSV Mini Library](https://www.npmjs.com/package/export-to-csv)
    ```
    > npm i export-to-csv
    ```
  
  - [NPM License Checker](https://www.npmjs.com/package/license-checker)
    ```
    > npm i -D license-checker
    ```

      <details>
        
      <summary>license-checker使用例</summary>
        
      ```
        > npx license-checker --packages ';@emotion/react@11.14.0;@emotion/styled@11.14.1;@mui/icons-material@7.3.2;@mui/material@7.3.2;@mui/x-date-pickers@8.11.2;@prisma/client@6.16.2;@tanstack/react-query@5.89.0;@tanstack/react-table@8.21.3;axios@1.12.2;export-to-csv@1.4.0;nodemailer@7.0.6;next@15.5.3;react@19.1.0;react-dom@19.1.0;' --customPath licensesFormat.json --json > licenses.json
      ```
        
      </details>

  - [Nodemailer](https://www.npmjs.com/package/nodemailer)
    ```
    > npm i nodemailer
    ```

    <details>
        
      <summary>テストメール送信時のログ</summary>
      
      ```
      { mail: 'user07@gmail.com', roleId: 3 }
       POST /api/user 200 in 82ms
       GET /api/user 200 in 20ms
      {
        accepted: [
          'local.zoom.connnect.test01@gmail.com',
          'sub.nakamura.xyz@gmail.com'
        ],
        rejected: [],
        ehlo: [
          'SIZE 35882577',
          '8BITMIME',
          'AUTH LOGIN PLAIN XOAUTH2 PLAIN-CLIENTTOKEN OAUTHBEARER XOAUTH',
          'ENHANCEDSTATUSCODES',
          'PIPELINING',
          'CHUNKING',
          'SMTPUTF8'
        ],
        envelopeTime: 1029,
        messageTime: 882,
        messageSize: 392,
        response: '250 2.0.0 OK  1758294612 d2e1a72fcca58-77d8c3adfd4sm4658797b3a.82 - gsmtp',
        envelope: {
          from: 'busininal-service-center-system@gmail.com',
          to: [
            'local.zoom.connnect.test01@gmail.com',
            'sub.nakamura.xyz@gmail.com'
          ]
        },
        messageId: '<9629fb02-7eb9-90f8-d534-c22c5b84a484@gmail.com>'
      }
      ```
      
      </details>

- 調査
  - Next.js & React
    | タスク          | 11 (64bit) | 備考 |
    | --------------- | ---------- | ---- |
    | DB Access       |     〇     | ライブラリ（[React Query](https://www.npmjs.com/package/@tanstack/react-query) Weekly Downloads Weekly Downloads 13,313,610）を利用（2025/09/19）|
    | UI              |     〇     | ライブラリ（[React Table](https://www.npmjs.com/package/material-react-table) Weekly Downloads 260,215）を利用（2025/09/19）|
    | List            |     〇     | 2025/09/19 |
    | Add             |     〇     | 2025/09/19 |
    | Update          |     〇     | 2025/09/19 |
    | Delete          |     〇     | 2025/09/19 |
    | CSV             |     ―     | |
    | Package         |     ―     | Webアプリのため, $${\color{yellow}タスク不正}$$（2025/09/19）|
    | S3              |     ―     | S3 Hosting |
    | Cognito         |     ―     |  |
    | API Gateway     |     ―     |  |
    | DynamoDB        |     ―     |  |
    | Log             |     ―     |  |
    | Error mail      |     〇     | ライブラリ（[Nodemailer](https://www.npmjs.com/package/nodemailer) Weekly Downloads 6,535,895）を利用（2025/09/19, クライアントからのAPI呼び出しでなく, サーバーの各API内で, エラーメール送信するように対応（2025/09/19）|
    | Restore         |     △     | データ削除後の復元パターンを想定, なお, $${\color{yellow}運用}$$で, カバーする方針（2025/09/19） |
    | License         |     〇     | ライブラリ（[NPM License Checker](https://www.npmjs.com/package/license-checker) Weekly Downloads Weekly Downloads 691,433）を利用（2025/09/19）|
    
- 課題
  - Deploy
  - ローカル環境で動作したものを本番環境(AWS)に移行する方法は？
