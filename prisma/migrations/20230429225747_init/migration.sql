-- AlterTable
ALTER TABLE "FileKeys" ALTER COLUMN "fileId" DROP NOT NULL,
ALTER COLUMN "resolution" DROP NOT NULL,
ALTER COLUMN "key" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Files" ALTER COLUMN "sizeInBytes" DROP NOT NULL,
ALTER COLUMN "type" DROP NOT NULL,
ALTER COLUMN "status" DROP NOT NULL,
ALTER COLUMN "extension" DROP NOT NULL,
ALTER COLUMN "mimeType" DROP NOT NULL;