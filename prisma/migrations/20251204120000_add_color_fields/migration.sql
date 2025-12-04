-- AlterTable: Add color fields to Card
ALTER TABLE "Card" ADD COLUMN "colorLight" TEXT;
ALTER TABLE "Card" ADD COLUMN "colorDark" TEXT;

-- AlterTable: Add color fields to BrandLogo
ALTER TABLE "BrandLogo" ADD COLUMN "colorLight" TEXT;
ALTER TABLE "BrandLogo" ADD COLUMN "colorDark" TEXT;



