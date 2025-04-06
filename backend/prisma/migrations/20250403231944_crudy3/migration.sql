/*
  Warnings:

  - A unique constraint covering the columns `[postId]` on the table `Attachement` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Attachement_postId_key" ON "Attachement"("postId");
