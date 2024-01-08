import { join } from 'node:path'
import { readFile } from 'node:fs/promises'
import { PrismaClient } from '@prisma/client'

const pathArg = process.argv[2]

if (!pathArg) {
  console.info('Usage: node seed.js <json file>')
  process.exit(0)
}

const path = join(process.cwd(), pathArg)

try {
  const raw = await readFile(path)
  /** @type {import('./seed/core.json')} */
  const data = JSON.parse(raw.toString())
  console.log('Seeding database...')
  const prisma = new PrismaClient({ log: ['info'] })
    for (const e of data.expansions) {
      // check if expansion already exists
      const existing = await prisma.expansion.findFirst({
        where: {
          name: e.name,
          type: e.type
        }
      })
      if (existing) {
        console.info(`Expansion ${existing.name} (${existing.type}) already exists (id: ${existing.id})`)
        process.exit(0)
      }
      try {
        // expansion
        const expansion = await prisma.expansion.create({
          data: { name: e.name, type: e.type }
        })
        // rewards
        for (const r of e.rewards) {
          await prisma.reward.create({
            data: { name: r.name, tagline: r.tagline, side: r.side, expansionId: expansion.id }
          })
        }
        // items
        for (const i of e.items) {
          await prisma.item.create({
            data: { name: i.name, tagline: i.tagline, cost: i.cost, tier: i.tier, expansionId: expansion.id }
          })
        }
        // troops
        for (const t of e.troops) {
          await prisma.troop.create({
            data: {
              name: t.name,
              unique: t.unique,
              elite: t.elite,
              deployment: t.deployment,
              reinforcement: t.reinforcement,
              size: t.size,
              traits: t.traits,
              expansionId: expansion.id
            }
          })
        }
        // missions
        for (const m of e.missions) {
          await prisma.mission.create({
            data: {
              name: m.name,
              type: m.type,
              start: m.start,
              end: m.end,
              expansionId: expansion.id
            }
          })
        }
        // heroes
        for (const h of e.heroes) {
          await prisma.hero.create({
            data: {
              name: h.name,
              tagline: h.tagline,
              missionId: (await prisma.mission.findFirst({
                where: { name: h.mission, expansionId: expansion.id }
              })).id,
              expansionId: expansion.id
            }
          })
        }
        // classes and class cards
        for (const c of e.classes) {
          await prisma.class.create({
            data: {
              name: c.name,
              side: c.side,
              heroId: (await prisma.hero.findFirst({
                where: { name: c.name }
              }))?.id,
              expansionId: expansion.id,
              cards: {
                create: c.deck.map(d => ({ name: d.name, tagline: d.tagline, cost: d.cost }))
              }
            }
          })
        }
        // agendas and agenda missions
        for (const a of e.agendas) {
          const deck = await prisma.agendaDeck.create({
            data: {
              name: a.name,
              expansionId: expansion.id
            }
          })
          for (const c of a.cards) {
            const card = await prisma.agenda.create({
              data: { name: c.name, cost: c.cost, tagline: c.tagline, deckId: deck.id }
            })
            if (c.mission) {
              await prisma.agendaMission.create({
                data: {
                  agendaId: card.id,
                  missionId: (await prisma.mission.findFirst({
                    where: {
                      name: c.mission,
                      expansionId: expansion.id
                    }
                  })).id,
                  forced: c.forced
                }
              })
            }
          }
        }
        // campaigns
        let campaign
        for (const c of e.campaigns) {
          campaign = await prisma.campaign.create({
            data: {
              name: c.name,
              period: c.period,
              startId: (await prisma.mission.findFirst({
                where: {
                  name: c.startingMission,
                  expansionId: expansion.id
                }
              })).id,
              missionSlots: {
                create: c.missions.map((m, i) => ({ index: i, threat: m.threat, type: m.type, itemTiers: m.itemTiers }))
              },
              expansionId: expansion.id
            }
          })
        }
        // mission rewards and placeholders
        for (const m of e.missions) {
          const mission = await prisma.mission.findFirst({
            where: {
              name: m.name,
              expansionId: expansion.id
            }
          })
          const missionId = mission.id
          for (const status of ['win','loss','all']) {
            const placeholders = m[status]?.placeholders
            if (placeholders) {
              // insert placeholders
              for (const [k, {type, label, ...validation}] of Object.entries(placeholders)) {
                await prisma.rewardPlaceholder.create({
                  data: {
                    name: k,
                    type,
                    label,
                    missionId,
                    campaignId: campaign.id,
                    validation: validation,
                    status: status.toUpperCase()
                  }
                })
              }
            }
            for (const side of ['REBEL','IMPERIAL','ALL']) {
              const rewardData = m[status]?.[side]
              if (rewardData) {
                await prisma.missionReward.create({
                  data: {
                    campaignId: campaign.id,
                    type: status.toUpperCase(),
                    side,
                    missionId,
                    condition: rewardData.condition,
                    multiplier: rewardData.multiplier,
                    xp: rewardData.xp,
                    credits: rewardData.credits,
                    influence: rewardData.influence,
                    rewardId: rewardData.reward ? (
                      await prisma.reward.findFirst({
                        where: {
                          name: rewardData.reward
                        }
                      })
                    ).id : undefined,
                    troopId: rewardData.troop ? (
                      await prisma.troop.findFirst({
                        where: {
                          name: rewardData.troop
                        }
                      })
                    ).id : undefined,
                    nextMissionId: rewardData.mission ? (
                      await prisma.mission.findFirst({
                        where: {
                          name: rewardData.mission,
                          expansionId: expansion.id
                        }
                      })
                    ).id : undefined,
                    forcedMissionId: rewardData.forcedMission ? (
                      await prisma.mission.findFirst({
                        where: {
                          name: rewardData.forcedMission,
                          expansionId: expansion.id
                        }
                      })
                    ).id : undefined
                  }
                })
              }
            }
          }
        }
        console.log(`Seeded data for expansion ${expansion.name} (${expansion.type}) [id: ${expansion.id}]`)
      } catch (error) {
        console.error(`Error seeding data for expansion ${e.name} (${e.type})`)
        console.error(error)
        process.exit(1)
      }
    }
} catch (error) {
  console.error(`Error reading JSON data from ${path}:`)
  console.error(error)
  process.exit(1)
}
