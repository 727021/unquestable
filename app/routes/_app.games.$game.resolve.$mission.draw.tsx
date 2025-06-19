import { MissionStage, MissionType } from '@prisma/client'
import type { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router'
import { redirect } from 'react-router'
import { useLoaderData } from 'react-router'
import { parseFormData, useForm, validationError } from '@rvf/react-router'
import { z } from 'zod'
import SideMissionsInput from '~/components/SideMissionsInput'
import SubmitButton from '~/components/SubmitButton'
import { prisma } from '~/services/db.server'
import { randomIndex } from '~/utils/randomIndex'
import { useId } from 'react'

const schema = z.object({
  missions: z
    .literal('RANDOM')
    .or(z.array(z.coerce.number().int().positive()).min(1).max(2))
})

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const mission = await prisma.gameMission.findUnique({
    where: {
      id: parseInt(params.mission!, 10),
      stage: MissionStage.CHOOSE_MISSION
    },
    select: {
      id: true
    }
  })

  if (!mission) {
    return redirect(`/games/${params.game}`)
  }

  const game = await prisma.game.findUnique({
    where: {
      id: parseInt(params.game!, 10)
    },
    select: {
      id: true,
      sideMissionDeck: {
        where: {
          gameMissions: {
            none: {
              gameId: parseInt(params.game!, 10)
            }
          }
        }
      },
      missions: {
        include: {
          mission: true
        }
      },
      campaign: {
        select: {
          missionSlots: true
        }
      }
    }
  })

  if (!game) {
    return redirect('/games')
  }

  const activeSideMissions = game.missions.filter(
    (m) => !m.forced && !m.stage && m.mission.type !== MissionType.STORY
  )
  const rebelSideMissions = activeSideMissions.filter(
    (m) => m.mission.type !== MissionType.IMPERIAL
  )
  const missionsNeeded = 2 - rebelSideMissions.length

  if (!missionsNeeded) {
    await prisma.gameMission.update({
      where: {
        id: mission.id
      },
      data: {
        stage: MissionStage.REBEL_BUY
      }
    })

    return redirect(`/games/${params.game}/resolve/${mission.id}/buy/rebel`)
  }

  const { data, error } = await parseFormData(await request.formData(), schema)

  if (error) {
    return validationError(error)
  }

  let chosenMissions: number[] = []
  if (data.missions === 'RANDOM') {
    chosenMissions = new Array(missionsNeeded)
      .fill(0)
      .map(
        () =>
          game.sideMissionDeck.splice(randomIndex(game.sideMissionDeck), 1)[0]
            .id
      )
  } else {
    chosenMissions = data.missions
    // TODO: validate chosen mission ids
  }

  await prisma.gameMission.createMany({
    data: chosenMissions.map((m) => ({
      gameId: game.id,
      missionId: m
    }))
  })

  await prisma.gameMission.update({
    where: {
      id: mission.id
    },
    data: {
      stage: MissionStage.REBEL_BUY
    }
  })

  return redirect(`/games/${params.game}/resolve/${mission.id}/buy/rebel`)
}

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const mission = await prisma.gameMission.findUnique({
    where: {
      id: parseInt(params.mission!, 10),
      stage: MissionStage.CHOOSE_MISSION
    },
    select: {
      id: true
    }
  })

  if (!mission) {
    return redirect(`/games/${params.game}`)
  }

  const game = await prisma.game.findUnique({
    where: {
      id: parseInt(params.game!, 10)
    },
    select: {
      id: true,
      sideMissionDeck: {
        where: {
          gameMissions: {
            none: {
              gameId: parseInt(params.game!, 10)
            }
          }
        }
      },
      missions: {
        include: {
          mission: true
        }
      },
      campaign: {
        select: {
          missionSlots: true
        }
      }
    }
  })

  if (!game) {
    return redirect('/games')
  }

  const activeSideMissions = game.missions.filter(
    (m) => !m.forced && !m.stage && m.mission.type !== MissionType.STORY
  )
  const rebelSideMissions = activeSideMissions.filter(
    (m) => m.mission.type !== MissionType.IMPERIAL
  )
  const missionsNeeded = 2 - rebelSideMissions.length

  if (!missionsNeeded) {
    await prisma.gameMission.update({
      where: {
        id: mission.id
      },
      data: {
        stage: MissionStage.REBEL_BUY
      }
    })

    return redirect(`/games/${params.game}/resolve/${mission.id}/buy/rebel`)
  }

  return {
    activeSideMissions,
    sideMissionDeck: game.sideMissionDeck,
    missionsNeeded
  }
}

type LoaderData = ReturnType<typeof useLoaderData<typeof loader>>

const ChooseStage = () => {
  const data = useLoaderData<LoaderData>()

  const formId = useId()
  const form = useForm({
    id: formId,
    schema,
    method: 'POST',
    defaultValues: {
      missions: []
    }
  })

  return (
    <>
      <h2 className="m-0">Draw Side Missions</h2>
      <form {...form.getFormProps()}>
        {form.renderFormIdInput()}
        <SideMissionsInput
          formApi={form}
          name="missions"
          count={data.missionsNeeded}
        >
          {data.sideMissionDeck.map((mission) => (
            <option key={mission.id} value={mission.id}>
              {mission.name}
            </option>
          ))}
        </SideMissionsInput>
        <SubmitButton formApi={form}>
          Draw Mission
          {data.missionsNeeded > 1 && 's'}
        </SubmitButton>
      </form>
    </>
  )
}

export default ChooseStage
