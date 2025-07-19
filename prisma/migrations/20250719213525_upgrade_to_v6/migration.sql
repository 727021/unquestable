-- AlterTable
ALTER TABLE "_AgendaDeckToImperialPlayer" ADD CONSTRAINT "_AgendaDeckToImperialPlayer_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_AgendaDeckToImperialPlayer_AB_unique";

-- AlterTable
ALTER TABLE "_ClassCardToImperialPlayer" ADD CONSTRAINT "_ClassCardToImperialPlayer_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_ClassCardToImperialPlayer_AB_unique";

-- AlterTable
ALTER TABLE "_ClassCardToRebelPlayer" ADD CONSTRAINT "_ClassCardToRebelPlayer_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_ClassCardToRebelPlayer_AB_unique";

-- AlterTable
ALTER TABLE "_ClassToClassCard" ADD CONSTRAINT "_ClassToClassCard_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_ClassToClassCard_AB_unique";

-- AlterTable
ALTER TABLE "_ExpansionToUser" ADD CONSTRAINT "_ExpansionToUser_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_ExpansionToUser_AB_unique";

-- AlterTable
ALTER TABLE "_GameToItem" ADD CONSTRAINT "_GameToItem_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_GameToItem_AB_unique";

-- AlterTable
ALTER TABLE "_GameToMission" ADD CONSTRAINT "_GameToMission_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_GameToMission_AB_unique";

-- AlterTable
ALTER TABLE "_GameToTroop" ADD CONSTRAINT "_GameToTroop_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_GameToTroop_AB_unique";

-- AlterTable
ALTER TABLE "_ImperialPlayerToReward" ADD CONSTRAINT "_ImperialPlayerToReward_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_ImperialPlayerToReward_AB_unique";

-- AlterTable
ALTER TABLE "_ImperialPlayerToTroop" ADD CONSTRAINT "_ImperialPlayerToTroop_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_ImperialPlayerToTroop_AB_unique";

-- AlterTable
ALTER TABLE "_RebelPlayerToReward" ADD CONSTRAINT "_RebelPlayerToReward_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_RebelPlayerToReward_AB_unique";

-- AlterTable
ALTER TABLE "_depend" ADD CONSTRAINT "_depend_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_depend_AB_unique";
