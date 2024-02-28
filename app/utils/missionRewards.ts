import { MissionRewardType, Side } from '@prisma/client'
import type { useLoaderData } from '@remix-run/react'
import type { loader as resolveMissionLoader } from '~/routes/_app.games.$game.resolve.$mission'

type RewardsOptions = ReturnType<
  typeof useLoaderData<typeof resolveMissionLoader>
>['mission'] & {
  crates?: number | null
  winner?: Side | null
  placeholderValues?: {
    [key: string]: any
  }
  heroes?: number | null
}

type CheckCondition = Pick<
  RewardsOptions,
  'rewardPlaceholders' | 'placeholderValues'
> & {
  reward: RewardsOptions['rewards'][0]
}

const getPlaceholderValue = ({
  placeholder,
  placeholderValues = {}
}: {
  placeholder: RewardsOptions['rewardPlaceholders'][0]
  placeholderValues: RewardsOptions['placeholderValues']
}) => {
  const rawValue = placeholderValues[placeholder.name]

  switch (placeholder.type) {
    case 'boolean':
      if (rawValue === 'true' || rawValue === true) return true
      if (rawValue === 'false' || rawValue === false) return false
      return
    case 'number':
      if (typeof rawValue === 'number') return rawValue
      if (typeof rawValue === 'string') return parseInt(rawValue, 10)
      return
    default:
      if (typeof rawValue === 'string') return rawValue
      return
  }
}

const checkCondition = ({
  reward,
  rewardPlaceholders,
  placeholderValues
}: CheckCondition) => {
  let condition = reward.condition
  if (!condition) return true
  for (const placeholder of rewardPlaceholders) {
    const value = getPlaceholderValue({ placeholder, placeholderValues })
    if (value !== undefined) {
      condition = condition?.replaceAll(`{{${placeholder.name}}}`, JSON.stringify(value))
    }
  }
  // eslint-disable-next-line no-eval
  const result = eval(condition)
  if (typeof result === 'boolean') return result
  return false
}

const checkMultiplier = ({
  reward,
  rewardPlaceholders,
  placeholderValues
}: CheckCondition) => {
  let multiplier = reward.multiplier
  if (!multiplier) return 1
  for (const placeholder of rewardPlaceholders) {
    const value = getPlaceholderValue({ placeholder, placeholderValues })
    if (value !== undefined) {
      multiplier = multiplier?.replaceAll(`{{${placeholder.name}}}`, JSON.stringify(value))
    }
  }
  // eslint-disable-next-line no-eval
  const result = eval(multiplier)
  if (typeof result === 'number') return result
  return 0
}

export const calculateRewards = ({
  hero,
  rewardPlaceholders,
  rewards,
  winner,
  crates = 0,
  placeholderValues = {},
  heroes
}: RewardsOptions) => {
  const relevantRewards = rewards.filter(
    (r) =>
      r.type === MissionRewardType.ALL ||
      r.type === (Side.REBEL ? MissionRewardType.WIN : MissionRewardType.LOSS)
  )
  const relevantPlaceholders = rewardPlaceholders.filter(
    (r) =>
      r.type === MissionRewardType.ALL ||
      r.type === (Side.REBEL ? MissionRewardType.WIN : MissionRewardType.LOSS)
  )

  let rebelXp = 0
  let credits = 0
  let allies: NonNullable<RewardsOptions['rewards'][0]['troop']>[] = []
  let rebelRewards: NonNullable<RewardsOptions['rewards'][0]['reward']>[] = []

  let imperialXp = 0
  let influence = 0
  let villains: NonNullable<RewardsOptions['rewards'][0]['troop']>[] = []
  let imperialRewards: NonNullable<RewardsOptions['rewards'][0]['reward']>[] = []

  let forcedMission = null
  let nextMission = null

  for (const reward of relevantRewards) {
    const condition = checkCondition({ reward, rewardPlaceholders: relevantPlaceholders, placeholderValues })
    const multiplier = checkMultiplier({ reward, rewardPlaceholders: relevantPlaceholders, placeholderValues })

    if (!condition) continue
  }

  return {
    credits,
    rebelXp,
    allies,
    rebelRewards,
    imperialXp,
    influence,
    villains,
    imperialRewards,
    forcedMission,
    nextMission
  }
}
