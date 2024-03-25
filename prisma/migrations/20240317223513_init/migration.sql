-- CreateEnum
CREATE TYPE "SetType" AS ENUM ('CAMPAIGN', 'HERO', 'VILLAIN');

-- CreateEnum
CREATE TYPE "Side" AS ENUM ('REBEL', 'IMPERIAL', 'ALL');

-- CreateEnum
CREATE TYPE "MissionType" AS ENUM ('STORY', 'IMPERIAL', 'RED', 'GREEN', 'GRAY');

-- CreateEnum
CREATE TYPE "MissionRewardType" AS ENUM ('WIN', 'LOSS', 'ALL');

-- CreateEnum
CREATE TYPE "MissionSlotType" AS ENUM ('STORY', 'SIDE');

-- CreateEnum
CREATE TYPE "MissionStage" AS ENUM ('REBEL_BUY', 'IMPERIAL_BUY', 'RESOLVED');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "discordId" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "discriminator" TEXT NOT NULL,
    "email" TEXT,
    "avatar" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Expansion" (
    "id" SERIAL NOT NULL,
    "type" "SetType" NOT NULL,
    "name" TEXT NOT NULL,
    "defaultOwned" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Expansion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BoxArt" (
    "id" SERIAL NOT NULL,
    "expansionId" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "mime" TEXT NOT NULL,
    "alt" TEXT,

    CONSTRAINT "BoxArt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClassCard" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "tagline" TEXT,
    "cost" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ClassCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Class" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "side" "Side" NOT NULL,
    "heroId" INTEGER,
    "expansionId" INTEGER NOT NULL,

    CONSTRAINT "Class_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Hero" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "tagline" TEXT NOT NULL,
    "expansionId" INTEGER NOT NULL,
    "missionId" INTEGER NOT NULL,

    CONSTRAINT "Hero_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reward" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "tagline" TEXT,
    "side" "Side" NOT NULL,
    "expansionId" INTEGER NOT NULL,

    CONSTRAINT "Reward_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Item" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "tagline" TEXT,
    "cost" INTEGER NOT NULL,
    "tier" INTEGER NOT NULL,
    "expansionId" INTEGER NOT NULL,

    CONSTRAINT "Item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Agenda" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "tagline" TEXT,
    "cost" INTEGER NOT NULL,
    "deckId" INTEGER NOT NULL,

    CONSTRAINT "Agenda_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgendaDeck" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "expansionId" INTEGER NOT NULL,

    CONSTRAINT "AgendaDeck_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgendaMission" (
    "agendaId" INTEGER NOT NULL,
    "missionId" INTEGER NOT NULL,
    "forced" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "AgendaMission_pkey" PRIMARY KEY ("agendaId","missionId")
);

-- CreateTable
CREATE TABLE "Mission" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" "MissionType" NOT NULL,
    "start" INTEGER,
    "end" INTEGER,
    "crates" INTEGER NOT NULL DEFAULT 0,
    "expansionId" INTEGER NOT NULL,

    CONSTRAINT "Mission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RewardPlaceholder" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "validation" JSONB NOT NULL DEFAULT '{}',
    "missionId" INTEGER NOT NULL,
    "campaignId" INTEGER NOT NULL,
    "status" "MissionRewardType" NOT NULL,

    CONSTRAINT "RewardPlaceholder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MissionReward" (
    "id" SERIAL NOT NULL,
    "type" "MissionRewardType" NOT NULL,
    "side" "Side" NOT NULL,
    "missionId" INTEGER NOT NULL,
    "campaignId" INTEGER NOT NULL,
    "condition" TEXT,
    "multiplier" TEXT,
    "xp" INTEGER,
    "credits" INTEGER,
    "influence" INTEGER,
    "rewardId" INTEGER,
    "troopId" INTEGER,
    "nextMissionId" INTEGER,
    "forcedMissionId" INTEGER,

    CONSTRAINT "MissionReward_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Troop" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "unique" BOOLEAN NOT NULL DEFAULT false,
    "elite" BOOLEAN NOT NULL DEFAULT false,
    "deployment" INTEGER NOT NULL,
    "reinforcement" INTEGER,
    "size" INTEGER NOT NULL DEFAULT 1,
    "traits" TEXT[],
    "expansionId" INTEGER NOT NULL,

    CONSTRAINT "Troop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Campaign" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "period" INTEGER NOT NULL,
    "startId" INTEGER NOT NULL,
    "expansionId" INTEGER NOT NULL,

    CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MissionSlot" (
    "id" SERIAL NOT NULL,
    "index" INTEGER NOT NULL,
    "type" "MissionSlotType" NOT NULL,
    "threat" INTEGER NOT NULL,
    "itemTiers" INTEGER[],
    "campaignId" INTEGER NOT NULL,

    CONSTRAINT "MissionSlot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Game" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "started" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "campaignId" INTEGER NOT NULL,
    "credits" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Game_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GameMission" (
    "id" SERIAL NOT NULL,
    "gameId" INTEGER NOT NULL,
    "missionSlotId" INTEGER,
    "forced" BOOLEAN NOT NULL DEFAULT false,
    "threat" INTEGER,
    "missionId" INTEGER NOT NULL,
    "stage" "MissionStage",
    "winner" "Side",

    CONSTRAINT "GameMission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RebelPlayer" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "gameId" INTEGER NOT NULL,
    "heroId" INTEGER NOT NULL,
    "xp" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "RebelPlayer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImperialPlayer" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "gameId" INTEGER NOT NULL,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "influence" INTEGER NOT NULL DEFAULT 0,
    "classId" INTEGER NOT NULL,

    CONSTRAINT "ImperialPlayer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_depend" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_ExpansionToUser" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_ClassCardToRebelPlayer" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_ClassCardToImperialPlayer" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_ClassToClassCard" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_AgendaToImperialPlayer" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_AgendaDeckToImperialPlayer" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_GameToMission" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_GameToItem" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_GameToTroop" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_RebelPlayerToReward" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_ImperialPlayerToReward" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_ImperialPlayerToTroop" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_discordId_key" ON "User"("discordId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Expansion_name_type_key" ON "Expansion"("name", "type");

-- CreateIndex
CREATE UNIQUE INDEX "BoxArt_expansionId_mime_key" ON "BoxArt"("expansionId", "mime");

-- CreateIndex
CREATE UNIQUE INDEX "Class_name_key" ON "Class"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Class_heroId_key" ON "Class"("heroId");

-- CreateIndex
CREATE UNIQUE INDEX "Hero_name_key" ON "Hero"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Hero_missionId_key" ON "Hero"("missionId");

-- CreateIndex
CREATE INDEX "Item_name_tier_idx" ON "Item"("name", "tier");

-- CreateIndex
CREATE UNIQUE INDEX "AgendaDeck_name_key" ON "AgendaDeck"("name");

-- CreateIndex
CREATE UNIQUE INDEX "AgendaMission_agendaId_key" ON "AgendaMission"("agendaId");

-- CreateIndex
CREATE UNIQUE INDEX "AgendaMission_missionId_key" ON "AgendaMission"("missionId");

-- CreateIndex
CREATE UNIQUE INDEX "Mission_name_expansionId_key" ON "Mission"("name", "expansionId");

-- CreateIndex
CREATE UNIQUE INDEX "MissionReward_missionId_type_side_key" ON "MissionReward"("missionId", "type", "side");

-- CreateIndex
CREATE UNIQUE INDEX "Campaign_startId_key" ON "Campaign"("startId");

-- CreateIndex
CREATE UNIQUE INDEX "ImperialPlayer_gameId_key" ON "ImperialPlayer"("gameId");

-- CreateIndex
CREATE UNIQUE INDEX "_depend_AB_unique" ON "_depend"("A", "B");

-- CreateIndex
CREATE INDEX "_depend_B_index" ON "_depend"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ExpansionToUser_AB_unique" ON "_ExpansionToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_ExpansionToUser_B_index" ON "_ExpansionToUser"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ClassCardToRebelPlayer_AB_unique" ON "_ClassCardToRebelPlayer"("A", "B");

-- CreateIndex
CREATE INDEX "_ClassCardToRebelPlayer_B_index" ON "_ClassCardToRebelPlayer"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ClassCardToImperialPlayer_AB_unique" ON "_ClassCardToImperialPlayer"("A", "B");

-- CreateIndex
CREATE INDEX "_ClassCardToImperialPlayer_B_index" ON "_ClassCardToImperialPlayer"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ClassToClassCard_AB_unique" ON "_ClassToClassCard"("A", "B");

-- CreateIndex
CREATE INDEX "_ClassToClassCard_B_index" ON "_ClassToClassCard"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_AgendaToImperialPlayer_AB_unique" ON "_AgendaToImperialPlayer"("A", "B");

-- CreateIndex
CREATE INDEX "_AgendaToImperialPlayer_B_index" ON "_AgendaToImperialPlayer"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_AgendaDeckToImperialPlayer_AB_unique" ON "_AgendaDeckToImperialPlayer"("A", "B");

-- CreateIndex
CREATE INDEX "_AgendaDeckToImperialPlayer_B_index" ON "_AgendaDeckToImperialPlayer"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_GameToMission_AB_unique" ON "_GameToMission"("A", "B");

-- CreateIndex
CREATE INDEX "_GameToMission_B_index" ON "_GameToMission"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_GameToItem_AB_unique" ON "_GameToItem"("A", "B");

-- CreateIndex
CREATE INDEX "_GameToItem_B_index" ON "_GameToItem"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_GameToTroop_AB_unique" ON "_GameToTroop"("A", "B");

-- CreateIndex
CREATE INDEX "_GameToTroop_B_index" ON "_GameToTroop"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_RebelPlayerToReward_AB_unique" ON "_RebelPlayerToReward"("A", "B");

-- CreateIndex
CREATE INDEX "_RebelPlayerToReward_B_index" ON "_RebelPlayerToReward"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ImperialPlayerToReward_AB_unique" ON "_ImperialPlayerToReward"("A", "B");

-- CreateIndex
CREATE INDEX "_ImperialPlayerToReward_B_index" ON "_ImperialPlayerToReward"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ImperialPlayerToTroop_AB_unique" ON "_ImperialPlayerToTroop"("A", "B");

-- CreateIndex
CREATE INDEX "_ImperialPlayerToTroop_B_index" ON "_ImperialPlayerToTroop"("B");

-- AddForeignKey
ALTER TABLE "BoxArt" ADD CONSTRAINT "BoxArt_expansionId_fkey" FOREIGN KEY ("expansionId") REFERENCES "Expansion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Class" ADD CONSTRAINT "Class_heroId_fkey" FOREIGN KEY ("heroId") REFERENCES "Hero"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Class" ADD CONSTRAINT "Class_expansionId_fkey" FOREIGN KEY ("expansionId") REFERENCES "Expansion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Hero" ADD CONSTRAINT "Hero_expansionId_fkey" FOREIGN KEY ("expansionId") REFERENCES "Expansion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Hero" ADD CONSTRAINT "Hero_missionId_fkey" FOREIGN KEY ("missionId") REFERENCES "Mission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reward" ADD CONSTRAINT "Reward_expansionId_fkey" FOREIGN KEY ("expansionId") REFERENCES "Expansion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_expansionId_fkey" FOREIGN KEY ("expansionId") REFERENCES "Expansion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Agenda" ADD CONSTRAINT "Agenda_deckId_fkey" FOREIGN KEY ("deckId") REFERENCES "AgendaDeck"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgendaDeck" ADD CONSTRAINT "AgendaDeck_expansionId_fkey" FOREIGN KEY ("expansionId") REFERENCES "Expansion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgendaMission" ADD CONSTRAINT "AgendaMission_agendaId_fkey" FOREIGN KEY ("agendaId") REFERENCES "Agenda"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgendaMission" ADD CONSTRAINT "AgendaMission_missionId_fkey" FOREIGN KEY ("missionId") REFERENCES "Mission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mission" ADD CONSTRAINT "Mission_expansionId_fkey" FOREIGN KEY ("expansionId") REFERENCES "Expansion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RewardPlaceholder" ADD CONSTRAINT "RewardPlaceholder_missionId_fkey" FOREIGN KEY ("missionId") REFERENCES "Mission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RewardPlaceholder" ADD CONSTRAINT "RewardPlaceholder_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MissionReward" ADD CONSTRAINT "MissionReward_missionId_fkey" FOREIGN KEY ("missionId") REFERENCES "Mission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MissionReward" ADD CONSTRAINT "MissionReward_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MissionReward" ADD CONSTRAINT "MissionReward_rewardId_fkey" FOREIGN KEY ("rewardId") REFERENCES "Reward"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MissionReward" ADD CONSTRAINT "MissionReward_troopId_fkey" FOREIGN KEY ("troopId") REFERENCES "Troop"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MissionReward" ADD CONSTRAINT "MissionReward_nextMissionId_fkey" FOREIGN KEY ("nextMissionId") REFERENCES "Mission"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MissionReward" ADD CONSTRAINT "MissionReward_forcedMissionId_fkey" FOREIGN KEY ("forcedMissionId") REFERENCES "Mission"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Troop" ADD CONSTRAINT "Troop_expansionId_fkey" FOREIGN KEY ("expansionId") REFERENCES "Expansion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_startId_fkey" FOREIGN KEY ("startId") REFERENCES "Mission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_expansionId_fkey" FOREIGN KEY ("expansionId") REFERENCES "Expansion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MissionSlot" ADD CONSTRAINT "MissionSlot_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameMission" ADD CONSTRAINT "GameMission_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameMission" ADD CONSTRAINT "GameMission_missionSlotId_fkey" FOREIGN KEY ("missionSlotId") REFERENCES "MissionSlot"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameMission" ADD CONSTRAINT "GameMission_missionId_fkey" FOREIGN KEY ("missionId") REFERENCES "Mission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RebelPlayer" ADD CONSTRAINT "RebelPlayer_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RebelPlayer" ADD CONSTRAINT "RebelPlayer_heroId_fkey" FOREIGN KEY ("heroId") REFERENCES "Hero"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImperialPlayer" ADD CONSTRAINT "ImperialPlayer_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImperialPlayer" ADD CONSTRAINT "ImperialPlayer_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_depend" ADD CONSTRAINT "_depend_A_fkey" FOREIGN KEY ("A") REFERENCES "Expansion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_depend" ADD CONSTRAINT "_depend_B_fkey" FOREIGN KEY ("B") REFERENCES "Expansion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ExpansionToUser" ADD CONSTRAINT "_ExpansionToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Expansion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ExpansionToUser" ADD CONSTRAINT "_ExpansionToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ClassCardToRebelPlayer" ADD CONSTRAINT "_ClassCardToRebelPlayer_A_fkey" FOREIGN KEY ("A") REFERENCES "ClassCard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ClassCardToRebelPlayer" ADD CONSTRAINT "_ClassCardToRebelPlayer_B_fkey" FOREIGN KEY ("B") REFERENCES "RebelPlayer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ClassCardToImperialPlayer" ADD CONSTRAINT "_ClassCardToImperialPlayer_A_fkey" FOREIGN KEY ("A") REFERENCES "ClassCard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ClassCardToImperialPlayer" ADD CONSTRAINT "_ClassCardToImperialPlayer_B_fkey" FOREIGN KEY ("B") REFERENCES "ImperialPlayer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ClassToClassCard" ADD CONSTRAINT "_ClassToClassCard_A_fkey" FOREIGN KEY ("A") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ClassToClassCard" ADD CONSTRAINT "_ClassToClassCard_B_fkey" FOREIGN KEY ("B") REFERENCES "ClassCard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AgendaToImperialPlayer" ADD CONSTRAINT "_AgendaToImperialPlayer_A_fkey" FOREIGN KEY ("A") REFERENCES "Agenda"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AgendaToImperialPlayer" ADD CONSTRAINT "_AgendaToImperialPlayer_B_fkey" FOREIGN KEY ("B") REFERENCES "ImperialPlayer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AgendaDeckToImperialPlayer" ADD CONSTRAINT "_AgendaDeckToImperialPlayer_A_fkey" FOREIGN KEY ("A") REFERENCES "AgendaDeck"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AgendaDeckToImperialPlayer" ADD CONSTRAINT "_AgendaDeckToImperialPlayer_B_fkey" FOREIGN KEY ("B") REFERENCES "ImperialPlayer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GameToMission" ADD CONSTRAINT "_GameToMission_A_fkey" FOREIGN KEY ("A") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GameToMission" ADD CONSTRAINT "_GameToMission_B_fkey" FOREIGN KEY ("B") REFERENCES "Mission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GameToItem" ADD CONSTRAINT "_GameToItem_A_fkey" FOREIGN KEY ("A") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GameToItem" ADD CONSTRAINT "_GameToItem_B_fkey" FOREIGN KEY ("B") REFERENCES "Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GameToTroop" ADD CONSTRAINT "_GameToTroop_A_fkey" FOREIGN KEY ("A") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GameToTroop" ADD CONSTRAINT "_GameToTroop_B_fkey" FOREIGN KEY ("B") REFERENCES "Troop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RebelPlayerToReward" ADD CONSTRAINT "_RebelPlayerToReward_A_fkey" FOREIGN KEY ("A") REFERENCES "RebelPlayer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RebelPlayerToReward" ADD CONSTRAINT "_RebelPlayerToReward_B_fkey" FOREIGN KEY ("B") REFERENCES "Reward"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ImperialPlayerToReward" ADD CONSTRAINT "_ImperialPlayerToReward_A_fkey" FOREIGN KEY ("A") REFERENCES "ImperialPlayer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ImperialPlayerToReward" ADD CONSTRAINT "_ImperialPlayerToReward_B_fkey" FOREIGN KEY ("B") REFERENCES "Reward"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ImperialPlayerToTroop" ADD CONSTRAINT "_ImperialPlayerToTroop_A_fkey" FOREIGN KEY ("A") REFERENCES "ImperialPlayer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ImperialPlayerToTroop" ADD CONSTRAINT "_ImperialPlayerToTroop_B_fkey" FOREIGN KEY ("B") REFERENCES "Troop"("id") ON DELETE CASCADE ON UPDATE CASCADE;
