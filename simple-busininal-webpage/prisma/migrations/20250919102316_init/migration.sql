-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Outbound" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "stock_id" INTEGER NOT NULL,
    "delivery_site_id" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "amount" INTEGER NOT NULL DEFAULT 0,
    "unitPrice" INTEGER NOT NULL DEFAULT 0,
    "unit" TEXT NOT NULL,
    "created_by" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Outbound_stock_id_fkey" FOREIGN KEY ("stock_id") REFERENCES "Stock" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Outbound_delivery_site_id_fkey" FOREIGN KEY ("delivery_site_id") REFERENCES "DeliverySite" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Outbound" ("amount", "created_at", "created_by", "delivery_site_id", "id", "quantity", "stock_id", "unit") SELECT "amount", "created_at", "created_by", "delivery_site_id", "id", "quantity", "stock_id", "unit" FROM "Outbound";
DROP TABLE "Outbound";
ALTER TABLE "new_Outbound" RENAME TO "Outbound";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
