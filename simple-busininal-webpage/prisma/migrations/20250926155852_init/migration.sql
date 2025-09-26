/*
  Warnings:

  - Made the column `updated_by` on table `Inbound` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updated_by` on table `Outbound` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Inbound" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "stock_id" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "amount" INTEGER NOT NULL DEFAULT 0,
    "unit_price" INTEGER NOT NULL DEFAULT 0,
    "unit" TEXT NOT NULL,
    "is_valid" BOOLEAN NOT NULL DEFAULT true,
    "created_by" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT NOT NULL,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Inbound_stock_id_fkey" FOREIGN KEY ("stock_id") REFERENCES "Stock" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Inbound" ("amount", "created_at", "created_by", "id", "is_valid", "quantity", "stock_id", "unit", "unit_price", "updated_at", "updated_by") SELECT "amount", "created_at", "created_by", "id", "is_valid", "quantity", "stock_id", "unit", "unit_price", coalesce("updated_at", CURRENT_TIMESTAMP) AS "updated_at", "updated_by" FROM "Inbound";
DROP TABLE "Inbound";
ALTER TABLE "new_Inbound" RENAME TO "Inbound";
CREATE TABLE "new_Outbound" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "stock_id" INTEGER NOT NULL,
    "delivery_site_id" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "amount" INTEGER NOT NULL DEFAULT 0,
    "unit_price" INTEGER NOT NULL DEFAULT 0,
    "unit" TEXT NOT NULL,
    "is_valid" BOOLEAN NOT NULL DEFAULT true,
    "created_by" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT NOT NULL,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Outbound_stock_id_fkey" FOREIGN KEY ("stock_id") REFERENCES "Stock" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Outbound_delivery_site_id_fkey" FOREIGN KEY ("delivery_site_id") REFERENCES "DeliverySite" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Outbound" ("amount", "created_at", "created_by", "delivery_site_id", "id", "is_valid", "quantity", "stock_id", "unit", "unit_price", "updated_at", "updated_by") SELECT "amount", "created_at", "created_by", "delivery_site_id", "id", "is_valid", "quantity", "stock_id", "unit", "unit_price", coalesce("updated_at", CURRENT_TIMESTAMP) AS "updated_at", "updated_by" FROM "Outbound";
DROP TABLE "Outbound";
ALTER TABLE "new_Outbound" RENAME TO "Outbound";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
