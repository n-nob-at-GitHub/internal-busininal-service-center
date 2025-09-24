/*
  Warnings:

  - You are about to drop the column `unitPrice` on the `Inbound` table. All the data in the column will be lost.
  - You are about to drop the column `unitPrice` on the `Outbound` table. All the data in the column will be lost.
  - You are about to drop the column `totalAmount` on the `Stock` table. All the data in the column will be lost.
  - You are about to drop the column `totalQuantity` on the `Stock` table. All the data in the column will be lost.

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
    "created_by" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Inbound_stock_id_fkey" FOREIGN KEY ("stock_id") REFERENCES "Stock" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Inbound" ("amount", "created_at", "created_by", "id", "quantity", "stock_id", "unit") SELECT "amount", "created_at", "created_by", "id", "quantity", "stock_id", "unit" FROM "Inbound";
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
    "created_by" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Outbound_stock_id_fkey" FOREIGN KEY ("stock_id") REFERENCES "Stock" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Outbound_delivery_site_id_fkey" FOREIGN KEY ("delivery_site_id") REFERENCES "DeliverySite" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Outbound" ("amount", "created_at", "created_by", "delivery_site_id", "id", "quantity", "stock_id", "unit") SELECT "amount", "created_at", "created_by", "delivery_site_id", "id", "quantity", "stock_id", "unit" FROM "Outbound";
DROP TABLE "Outbound";
ALTER TABLE "new_Outbound" RENAME TO "Outbound";
CREATE TABLE "new_Stock" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "material_id" INTEGER NOT NULL,
    "total_quantity" INTEGER NOT NULL DEFAULT 0,
    "total_amount" INTEGER NOT NULL DEFAULT 0,
    "unit" TEXT NOT NULL,
    "note" TEXT,
    "created_by" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT NOT NULL,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Stock_material_id_fkey" FOREIGN KEY ("material_id") REFERENCES "Material" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Stock" ("created_at", "created_by", "id", "material_id", "note", "unit", "updated_at", "updated_by") SELECT "created_at", "created_by", "id", "material_id", "note", "unit", "updated_at", "updated_by" FROM "Stock";
DROP TABLE "Stock";
ALTER TABLE "new_Stock" RENAME TO "Stock";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
