import { json, type LoaderFunctionArgs } from '@remix-run/node'
import {
  Link,
  Outlet,
  useLoaderData,
  useLocation,
  useParams
} from '@remix-run/react'
import { getUser } from '~/services/auth.server'
import { prisma } from '~/services/db.server'
import { ArrowUturnLeftIcon } from '@heroicons/react/24/outline'

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const user = await getUser(request)

  if (!params.game) {
    throw new Response(null, { status: 404 })
  }
  const gameId = parseInt(params.game, 10)
  if (isNaN(gameId)) {
    throw new Response(null, { status: 404 })
  }

  const game = await prisma.game.findUnique({
    where: {
      id: gameId,
      userId: user.id
    },
    select: {
      name: true,
      campaign: {
        select: {
          name: true,
          missionSlots: {
            select: {
              id: true,
              index: true,
              threat: true,
              type: true,
              gameMissions: {
                where: {
                  gameId
                },
                select: {
                  id: true,
                  forced: true,
                  stage: true,
                  winner: true,
                  mission: {
                    select: {
                      name: true,
                      type: true
                    }
                  }
                },
                take: 1
              }
            },
            orderBy: {
              index: 'asc'
            }
          }
        }
      },
      missions: {
        select: {
          id: true,
          forced: true,
          stage: true,
          winner: true,
          mission: {
            select: {
              id: true,
              name: true,
              type: true
            }
          }
        },
        where: {
          missionSlot: null
        }
      },
      imperialPlayer: {
        select: {
          name: true,
          xp: true,
          influence: true,
          class: {
            select: {
              id: true,
              name: true,
              cards: {
                select: {
                  id: true,
                  name: true,
                  cost: true
                }
              }
            }
          },
          agendaDecks: {
            select: {
              name: true,
              agendas: {
                select: {
                  id: true,
                  name: true,
                  cost: true,
                }
              }
            }
          },
          agendas: {
            select: {
              id: true,
              name: true,
              cost: true
            }
          },
          classCards: {
            select: {
              id: true,
              name: true,
              cost: true
            }
          },
          rewards: {
            select: {
              id: true,
              name: true
            }
          }
        }
      },
      rebelPlayers: {
        select: {
          id: true,
          name: true,
          xp: true,
          hero: {
            select: {
              name: true,
              id: true,
              class: {
                select: {
                  cards: {
                    select: {
                      id: true,
                      name: true,
                      cost: true
                    }
                  }
                }
              }
            }
          },
          classCards: {
            select: {
              id: true,
              name: true,
              cost: true
            }
          },
          rewards: {
            select: {
              id: true,
              name: true
            }
          }
        }
      },
      credits: true,
      items: {
        select: {
          id: true,
          name: true,
          tier: true,
          cost: true
        }
      },
      sideMissionDeck: {
        select: {
          type: true,
          id: true,
          name: true
        },
        where: {
          gameMissions: {
            every: {
              id: undefined
            }
          }
        }
      }
    }
  })

  if (!game) {
    throw new Response(null, { status: 404 })
  }

  return json({ game })
}

export type LoaderData = ReturnType<typeof useLoaderData<typeof loader>>

const GameLayout = () => {
  const data = useLoaderData<typeof loader>()
  const location = useLocation()
  const params = useParams()

  const root = /^\/games\/\d+$/.test(location.pathname)

  return (
    <div className="prose p-4 w-full max-w-full whitespace-nowrap">
      <div className="flex gap-1 items-end">
        <h1 className="m-0">{data.game.name}</h1>
        {!root && (
          <Link to={`/games/${params.game}`} className="btn btn-ghost btn-sm">
            <ArrowUturnLeftIcon className="w-4 h-4" />
          </Link>
        )}
      </div>
      <Outlet context={data} />
    </div>
  )
}

export default GameLayout
