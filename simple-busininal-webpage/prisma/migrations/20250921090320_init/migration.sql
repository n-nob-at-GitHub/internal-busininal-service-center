-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_DeliverySite" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "contact" TEXT
);
INSERT INTO "new_DeliverySite" ("contact", "id", "name") SELECT "contact", "id", "name" FROM "DeliverySite";
DROP TABLE "DeliverySite";
ALTER TABLE "new_DeliverySite" RENAME TO "DeliverySite";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
