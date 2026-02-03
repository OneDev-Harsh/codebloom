-- CreateTable
CREATE TABLE "ProjectComment" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectComment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProjectComment_projectId_idx" ON "ProjectComment"("projectId");

-- CreateIndex
CREATE INDEX "ProjectComment_userId_idx" ON "ProjectComment"("userId");

-- AddForeignKey
ALTER TABLE "ProjectComment" ADD CONSTRAINT "ProjectComment_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "WebsiteProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectComment" ADD CONSTRAINT "ProjectComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
