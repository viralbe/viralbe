-- CreateTable
CREATE TABLE "UserSearch" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "searches" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserSearch_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserSearch_userId_key" ON "UserSearch"("userId");
