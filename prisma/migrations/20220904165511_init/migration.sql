-- CreateTable
CREATE TABLE "discord_user" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "discordUserId" TEXT NOT NULL,
    "klaytnEoaAddress" TEXT NOT NULL,
    "role" TEXT NOT NULL,

    CONSTRAINT "discord_user_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "discord_user_discordUserId_key" ON "discord_user"("discordUserId");

-- CreateIndex
CREATE UNIQUE INDEX "discord_user_klaytnEoaAddress_key" ON "discord_user"("klaytnEoaAddress");
