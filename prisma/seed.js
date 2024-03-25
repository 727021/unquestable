/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  MissionRewardType,
  MissionSlotType,
  MissionType,
  PrismaClient,
  SetType,
  Side
} from '@prisma/client'

const prisma = new PrismaClient({ log: ['info'] })

// CORE
console.log('Seeding data for core game')
const core = await prisma.expansion.create({
  data: {
    name: 'Core',
    type: SetType.CAMPAIGN,
    defaultOwned: true
  },
  select: {
    id: true
  }
})

// rewards
await prisma.reward.createMany({
  data: [
    {
      expansionId: core.id,
      name: 'Shadow Suit',
      tagline: '"They call it photoreactive plasteel. I call it brilliant."',
      side: Side.REBEL
    },
    {
      expansionId: core.id,
      name: 'Adrenal Implant',
      tagline:
        '"Integrated stimulants for enhanced performance in any environment."',
      side: Side.REBEL
    },
    {
      expansionId: core.id,
      name: 'The Ways of the Force',
      tagline:
        '"It surrounds us and penetrates us. It binds the galaxy together."\n—Obi-Wan Kenobi, A New Hope',
      side: Side.REBEL
    },
    {
      expansionId: core.id,
      name: 'Veteran Prowess',
      tagline:
        '"No man can win a war alone, but the right soldier in the right place can tip the scales in the right direction."',
      side: Side.REBEL
    },
    {
      expansionId: core.id,
      name: 'Peacemaker',
      tagline: '"I like to get the last word in an argument."',
      side: Side.REBEL
    },
    {
      expansionId: core.id,
      name: "Shu Yen's Lightsaber",
      side: Side.REBEL
    },
    {
      expansionId: core.id,
      name: 'Life Debt',
      tagline:
        "The only thing more powerful than a Wookiee's strength is his loyalty.",
      side: Side.REBEL
    },
    {
      expansionId: core.id,
      name: 'Fearless Leader',
      tagline: '"We stand together or not at all."',
      side: Side.REBEL
    },
    {
      expansionId: core.id,
      name: 'Allied Operations',
      tagline: '"We must all do our part."',
      side: Side.REBEL
    },
    {
      expansionId: core.id,
      name: 'Rebel Recon',
      tagline: '"Know the battlefield."',
      side: Side.REBEL
    },
    {
      expansionId: core.id,
      name: 'Old Wounds',
      side: Side.IMPERIAL
    },
    {
      expansionId: core.id,
      name: 'Special Operations',
      side: Side.IMPERIAL
    },
    {
      expansionId: core.id,
      name: 'Supply Deficit',
      side: Side.IMPERIAL
    },
    {
      expansionId: core.id,
      name: 'Imperial Industry',
      side: Side.IMPERIAL
    },
    {
      expansionId: core.id,
      name: 'Heroic',
      side: Side.REBEL
    },
    {
      expansionId: core.id,
      name: 'Legendary',
      side: Side.REBEL
    }
  ]
})
console.log('Seeded reward cards')

// items
await prisma.item.createMany({
  data: [
    {
      expansionId: core.id,
      name: 'Marksman Barrel',
      tagline:
        'The fluted barrel accelerates the blaster bolt without sacrificing power.',
      cost: 300,
      tier: 1
    },
    {
      expansionId: core.id,
      name: 'E-11',
      tagline: 'Standard issue for all Imperial Stormtroopers.',
      cost: 400,
      tier: 1
    },
    {
      expansionId: core.id,
      name: 'Armored Gauntlets',
      cost: 300,
      tier: 1
    },
    {
      expansionId: core.id,
      name: 'Extended Haft',
      tagline: 'Leverage and reach applied to deadly purpose.',
      cost: 300,
      tier: 1
    },
    {
      expansionId: core.id,
      name: 'Combat Coat',
      tagline: 'Practical and stylish.',
      cost: 500,
      tier: 1
    },
    {
      expansionId: core.id,
      name: 'Survival Gear',
      cost: 250,
      tier: 1
    },
    {
      expansionId: core.id,
      name: 'Portable Medkit',
      tagline: 'Designed for treatment during times of crisis.',
      cost: 450,
      tier: 1
    },
    {
      expansionId: core.id,
      name: 'Balanced Hilt',
      tagline: 'Favored by fencers and brawlers alike.',
      cost: 300,
      tier: 1
    },
    {
      expansionId: core.id,
      name: 'DH-17',
      tagline: 'Favored by the Rebellion for its reliability.',
      cost: 200,
      tier: 1
    },
    {
      expansionId: core.id,
      name: 'DL-44',
      tagline: 'The choice weapon of smugglers across the galaxy.',
      cost: 500,
      tier: 1
    },
    {
      expansionId: core.id,
      name: 'Vibroblade',
      tagline: 'The gentle hum warns you of its true nature.',
      cost: 300,
      tier: 1
    },
    {
      expansionId: core.id,
      name: 'Tactical Display',
      tagline: "Don't turn off your targeting computer.",
      cost: 300,
      tier: 1
    },
    {
      expansionId: core.id,
      name: 'Combat Coat',
      tagline: 'Practical and stylish.',
      cost: 500,
      tier: 2
    },
    {
      expansionId: core.id,
      name: 'A280',
      tagline: 'A sturdy weapon designed to pierce heavy armor.',
      cost: 600,
      tier: 2
    },
    {
      expansionId: core.id,
      name: 'T-21',
      tagline: 'Favored by Imperial heavy troopers for its firepower.',
      cost: 900,
      tier: 2
    },
    {
      expansionId: core.id,
      name: '434 "Deathhammer"',
      tagline: 'Deadly firepower in a heavy durasteel casing.',
      cost: 600,
      tier: 2
    },
    {
      expansionId: core.id,
      name: 'Vibro Knucklers',
      tagline: 'Concealable blades that can cut armor and bone alike.',
      cost: 400,
      tier: 2
    },
    {
      expansionId: core.id,
      name: 'BD-1 Vibro-Ax',
      tagline: 'The intimidation factor is a secondary bonus.',
      cost: 600,
      tier: 2
    },
    {
      expansionId: core.id,
      name: 'High-Impact Guard',
      tagline: 'Layered durasteel for both offense and defense.',
      cost: 500,
      tier: 2
    },
    {
      expansionId: core.id,
      name: 'Spread Barrel',
      tagline: 'An ideal solution for close-quarters combat.',
      cost: 300,
      tier: 2
    },
    {
      expansionId: core.id,
      name: 'Overcharger',
      tagline:
        'A modified cell that unloads the entire energy payload in a single blaster bolt.',
      cost: 300,
      tier: 2
    },
    {
      expansionId: core.id,
      name: 'Laminate Armor',
      tagline: 'Enhanced plating to deflect blaster bolts and shrapnel.',
      cost: 700,
      tier: 2
    },
    {
      expansionId: core.id,
      name: 'Extra Ammunition',
      tagline: "Don't worry about ammo. Just keep shooting.",
      cost: 300,
      tier: 2
    },
    {
      expansionId: core.id,
      name: 'Slicing Tools',
      cost: 250,
      tier: 2
    },
    {
      expansionId: core.id,
      name: 'Pulse Cannon',
      tagline: 'The weapon of choice for bounty hunters like IG-88.',
      cost: 1200,
      tier: 3
    },
    {
      expansionId: core.id,
      name: 'DXR-6',
      tagline: 'It tears the victim apart at the molecular level.',
      cost: 1000,
      tier: 3
    },
    {
      expansionId: core.id,
      name: 'Sporting Blaster',
      cost: 900,
      tier: 3
    },
    {
      expansionId: core.id,
      name: 'Force Pike',
      cost: 1000,
      tier: 3
    },
    {
      expansionId: core.id,
      name: 'Laminate Armor',
      tagline: 'Enhanced plating to deflect blaster bolts and shrapnel.',
      cost: 700,
      tier: 3
    },
    {
      expansionId: core.id,
      name: 'Personal Shields',
      tagline:
        'Practical personal shield generators are rare and should be used sparingly.',
      cost: 550,
      tier: 3
    },
    {
      expansionId: core.id,
      name: 'Reinforced Helmet',
      cost: 300,
      tier: 3
    },
    {
      expansionId: core.id,
      name: 'Combat Visor',
      cost: 350,
      tier: 3
    },
    {
      expansionId: core.id,
      name: 'Combat Knife',
      cost: 500,
      tier: 3
    },
    {
      expansionId: core.id,
      name: 'Shock Emitter',
      tagline: 'Even archaic weapons can benefit from new technology.',
      cost: 500,
      tier: 3
    },
    {
      expansionId: core.id,
      name: 'Disruption Cell',
      tagline: '"Very powerful. Very illegal."',
      cost: 600,
      tier: 3
    },
    {
      expansionId: core.id,
      name: 'Telescoping Sights',
      tagline: '"Make every shot count."',
      cost: 400,
      tier: 3
    }
  ]
})
console.log('Seeded items')

// troops
await prisma.troop.createMany({
  data: [
    {
      expansionId: core.id,
      name: 'Chewbacca (Loyal Wookiee)',
      unique: true,
      elite: true,
      deployment: 15,
      traits: ['Smuggler', 'Wookiee', 'Guardian']
    },
    {
      expansionId: core.id,
      name: 'Han Solo (Scoundrel)',
      unique: true,
      elite: true,
      deployment: 12,
      traits: ['Smuggler', 'Leader']
    },
    {
      expansionId: core.id,
      name: 'Luke Skywalker (Hero of the Rebellion)',
      unique: true,
      elite: true,
      deployment: 10,
      traits: ['Force User']
    },
    {
      expansionId: core.id,
      name: 'Fenn Signis',
      unique: true,
      deployment: 9,
      traits: ['Trooper', 'Leader']
    },
    {
      expansionId: core.id,
      name: 'Gaarkhan',
      unique: true,
      deployment: 8,
      traits: ['Wookiee', 'Guardian', 'Brawler']
    },
    {
      expansionId: core.id,
      name: 'Diala Passil',
      unique: true,
      deployment: 7,
      traits: ['Force User', 'Brawler']
    },
    {
      expansionId: core.id,
      name: 'Jyn Odan',
      unique: true,
      deployment: 5,
      traits: ['Smuggler']
    },
    {
      expansionId: core.id,
      name: 'Gideon Argus',
      unique: true,
      deployment: 3,
      traits: ['Leader']
    },
    {
      expansionId: core.id,
      name: "Mak Eshka'rey",
      unique: true,
      deployment: 3,
      traits: ['Spy']
    },
    {
      expansionId: core.id,
      name: 'Rebel Saboteur',
      deployment: 5,
      reinforcement: 3,
      size: 2,
      traits: ['Spy', 'Heavy Weapon']
    },
    {
      expansionId: core.id,
      name: 'Rebel Trooper',
      deployment: 6,
      reinforcement: 2,
      size: 3,
      traits: ['Trooper']
    },
    {
      expansionId: core.id,
      name: 'IG-88 (Assassin Droid)',
      unique: true,
      elite: true,
      deployment: 12,
      traits: ['Droid', 'Hunter']
    },
    {
      expansionId: core.id,
      name: 'Trandoshan Hunter',
      deployment: 7,
      reinforcement: 3,
      size: 2,
      traits: ['Hunter', 'Brawler']
    },
    {
      expansionId: core.id,
      name: 'Trandoshan Hunter',
      elite: true,
      deployment: 10,
      reinforcement: 5,
      size: 2,
      traits: ['Hunter', 'Brawler']
    },
    {
      expansionId: core.id,
      name: 'Nexu',
      deployment: 4,
      traits: ['Creature', 'Brawler']
    },
    {
      expansionId: core.id,
      name: 'Nexu',
      elite: true,
      deployment: 6,
      traits: ['Creature', 'Brawler']
    },
    {
      expansionId: core.id,
      name: 'AT-ST',
      elite: true,
      deployment: 14,
      traits: ['Vehicle', 'Heavy Weapon']
    },
    {
      expansionId: core.id,
      name: 'Royal Guard Champion',
      unique: true,
      elite: true,
      deployment: 15,
      traits: ['Guardian', 'Brawler']
    },
    {
      expansionId: core.id,
      name: 'General Weiss (Field Commander)',
      unique: true,
      elite: true,
      deployment: 16,
      traits: ['Vehicle', 'Leader', 'Heavy Weapon']
    },
    {
      expansionId: core.id,
      name: 'Darth Vader (Lord of the Sith)',
      unique: true,
      elite: true,
      deployment: 18,
      traits: ['Force User', 'Leader', 'Brawler']
    },
    {
      expansionId: core.id,
      name: 'Royal Guard',
      deployment: 8,
      reinforcement: 4,
      size: 2,
      traits: ['Guardian', 'Brawler']
    },
    {
      expansionId: core.id,
      name: 'Royal Guard',
      elite: true,
      deployment: 12,
      reinforcement: 6,
      size: 2,
      traits: ['Guardian', 'Brawler']
    },
    {
      expansionId: core.id,
      name: 'E-Web Engineer',
      deployment: 6,
      traits: ['Trooper', 'Heavy Weapon']
    },
    {
      expansionId: core.id,
      name: 'E-Web Engineer',
      elite: true,
      deployment: 8,
      traits: ['Trooper', 'Heavy Weapon']
    },
    {
      expansionId: core.id,
      name: 'Probe Droid',
      deployment: 3,
      traits: ['Droid']
    },
    {
      expansionId: core.id,
      name: 'Probe Droid',
      elite: true,
      deployment: 5,
      traits: ['Droid']
    },
    {
      expansionId: core.id,
      name: 'Imperial Officer',
      deployment: 2,
      traits: ['Leader']
    },
    {
      expansionId: core.id,
      name: 'Imperial Officer',
      elite: true,
      deployment: 5,
      traits: ['Leader']
    },
    {
      expansionId: core.id,
      name: 'Stormtrooper',
      deployment: 6,
      reinforcement: 2,
      size: 3,
      traits: ['Trooper']
    },
    {
      expansionId: core.id,
      name: 'Stormtrooper',
      elite: true,
      deployment: 9,
      reinforcement: 3,
      size: 3,
      traits: ['Trooper']
    }
  ]
})
console.log('Seeded troops')

// missions
const darkObsession = await prisma.mission.create({
  data: {
    expansionId: core.id,
    name: 'Dark Obsession',
    type: MissionType.IMPERIAL,
    start: 1,
    end: 6,
    crates: 2
  }
})
const wanted = await prisma.mission.create({
  data: {
    expansionId: core.id,
    name: 'Wanted',
    type: MissionType.IMPERIAL,
    crates: 2
  }
})
const impounded = await prisma.mission.create({
  data: {
    expansionId: core.id,
    name: 'Impounded',
    type: MissionType.IMPERIAL,
    crates: 2
  }
})
const breakingPoint = await prisma.mission.create({
  data: {
    expansionId: core.id,
    name: 'Breaking Point',
    type: MissionType.IMPERIAL,
    crates: 2
  }
})
const meansOfProduction = await prisma.mission.create({
  data: {
    expansionId: core.id,
    name: 'Means of Production',
    type: MissionType.IMPERIAL,
    crates: 2
  }
})
const captured = await prisma.mission.create({
  data: {
    expansionId: core.id,
    name: 'Captured',
    type: MissionType.IMPERIAL
  }
})
const brushfire = await prisma.mission.create({
  data: {
    expansionId: core.id,
    name: 'Brushfire',
    type: MissionType.RED,
    crates: 4
  }
})
const temptation = await prisma.mission.create({
  data: {
    expansionId: core.id,
    name: 'Temptation',
    type: MissionType.RED,
    crates: 4
  }
})
const friendsOfOld = await prisma.mission.create({
  data: {
    expansionId: core.id,
    name: 'Friends of Old',
    type: MissionType.RED,
    crates: 4
  }
})
const looseCannon = await prisma.mission.create({
  data: {
    expansionId: core.id,
    name: 'Loose Cannon',
    type: MissionType.RED,
    crates: 4
  }
})
const indebted = await prisma.mission.create({
  data: {
    expansionId: core.id,
    name: 'Indebted',
    type: MissionType.RED,
    crates: 4
  }
})
const highMoon = await prisma.mission.create({
  data: {
    expansionId: core.id,
    name: 'High Moon',
    type: MissionType.RED,
    crates: 4
  }
})
const sympathyForTheRebellion = await prisma.mission.create({
  data: {
    expansionId: core.id,
    name: 'Sympathy for the Rebellion',
    type: MissionType.GRAY,
    start: 3,
    end: 4,
    crates: 3
  }
})
const luxuryCruise = await prisma.mission.create({
  data: {
    expansionId: core.id,
    name: 'Luxury Cruise',
    type: MissionType.GRAY,
    crates: 4
  }
})
const generousDonations = await prisma.mission.create({
  data: {
    expansionId: core.id,
    name: 'Generous Donations',
    type: MissionType.GRAY,
    crates: 4
  }
})
const aSimpleTask = await prisma.mission.create({
  data: {
    expansionId: core.id,
    name: 'A Simple Task',
    type: MissionType.GRAY,
    crates: 4
  }
})
const vipersDen = await prisma.mission.create({
  data: {
    expansionId: core.id,
    name: "Viper's Den",
    type: MissionType.GRAY,
    crates: 4
  }
})
const targetOfOpportunity = await prisma.mission.create({
  data: {
    expansionId: core.id,
    name: 'Target of Opportunity',
    type: MissionType.GREEN,
    crates: 4
  }
})
const theSpiceJob = await prisma.mission.create({
  data: {
    expansionId: core.id,
    name: 'The Spice Job',
    type: MissionType.GREEN,
    start: 2,
    end: 7,
    crates: 4
  }
})
const homecoming = await prisma.mission.create({
  data: {
    expansionId: core.id,
    name: 'Homecoming',
    type: MissionType.GREEN,
    start: 3,
    end: 4,
    crates: 4
  }
})
const sorryAboutTheMess = await prisma.mission.create({
  data: {
    expansionId: core.id,
    name: 'Sorry About the Mess',
    type: MissionType.GREEN,
    start: 2,
    end: 4,
    crates: 4
  }
})
const desperateHour = await prisma.mission.create({
  data: {
    expansionId: core.id,
    name: 'Desperate Hour',
    type: MissionType.STORY,
    crates: 4
  }
})
const lastStand = await prisma.mission.create({
  data: {
    expansionId: core.id,
    name: 'Last Stand',
    type: MissionType.STORY,
    crates: 4
  }
})
const theSource = await prisma.mission.create({
  data: {
    expansionId: core.id,
    name: 'The Source',
    type: MissionType.STORY,
    crates: 4
  }
})
const chainOfCommand = await prisma.mission.create({
  data: {
    expansionId: core.id,
    name: 'Chain of Command',
    type: MissionType.STORY,
    crates: 4
  }
})
const drawnIn = await prisma.mission.create({
  data: {
    expansionId: core.id,
    name: 'Drawn In',
    type: MissionType.STORY,
    crates: 4
  }
})
const incoming = await prisma.mission.create({
  data: {
    expansionId: core.id,
    name: 'Incoming',
    type: MissionType.STORY,
    crates: 4
  }
})
const flySolo = await prisma.mission.create({
  data: {
    expansionId: core.id,
    name: 'Fly Solo',
    type: MissionType.STORY,
    crates: 4
  }
})
const imperialHospitality = await prisma.mission.create({
  data: {
    expansionId: core.id,
    name: 'Imperial Hospitality',
    type: MissionType.STORY,
    crates: 4
  }
})
const underSiege = await prisma.mission.create({
  data: {
    expansionId: core.id,
    name: 'Under Siege',
    type: MissionType.STORY,
    crates: 4
  }
})
const aNewThreat = await prisma.mission.create({
  data: {
    expansionId: core.id,
    name: 'A New Threat',
    type: MissionType.STORY,
    crates: 4
  }
})
const aftermath = await prisma.mission.create({
  data: {
    expansionId: core.id,
    name: 'Aftermath',
    type: MissionType.STORY,
    crates: 3
  }
})
console.log('Seeded missions')

// heroes
const fennSignis = await prisma.hero.create({
  data: {
    expansionId: core.id,
    name: 'Fenn Signis',
    tagline: 'Hardened Veteran',
    missionId: brushfire.id
  }
})
const dialaPassil = await prisma.hero.create({
  data: {
    expansionId: core.id,
    name: 'Diala Passil',
    tagline: 'Haunted Exile',
    missionId: temptation.id
  }
})
const gideonArgus = await prisma.hero.create({
  data: {
    expansionId: core.id,
    name: 'Gideon Argus',
    tagline: 'Valiant Commander',
    missionId: friendsOfOld.id
  }
})
const makEshkarey = await prisma.hero.create({
  data: {
    expansionId: core.id,
    name: "Mak Eshka'rey",
    tagline: 'Bold Renegade',
    missionId: looseCannon.id
  }
})
const gaarkhan = await prisma.hero.create({
  data: {
    expansionId: core.id,
    name: 'Gaarkhan',
    tagline: 'Fierce Warrior',
    missionId: indebted.id
  }
})
const jynOdan = await prisma.hero.create({
  data: {
    expansionId: core.id,
    name: 'Jyn Odan',
    tagline: 'Sly Smuggler',
    missionId: highMoon.id
  }
})
console.log('Seeded heroes')

// classes
await prisma.class.create({
  data: {
    expansionId: core.id,
    name: fennSignis.name,
    side: Side.REBEL,
    heroId: fennSignis.id,
    cards: {
      create: [
        {
          name: 'Infantry Rifle',
          tagline: "An older model, but is's reliable and well maintained.",
          cost: 0
        },
        {
          name: 'Take Cover',
          tagline: '"You don\'t fight the Empire without learning to duck."',
          cost: 1
        },
        {
          name: 'Tactical Movement',
          tagline: '"Stick together and don\'t get in my way."',
          cost: 1
        },
        {
          name: 'Adrenaline Rush',
          tagline: '"Who needs stimpaks?"',
          cost: 2
        },
        {
          name: 'Weapon Expert',
          tagline: '"If it can kill a trooper, I can make it work."',
          cost: 2
        },
        {
          name: 'Suppressive Fire',
          tagline: '"This one\'s for Alderaan."',
          cost: 3
        },
        {
          name: 'Trench Fighter',
          tagline: '"It\'s messy work, but someone\'s got to do it."',
          cost: 3
        },
        {
          name: 'Superior Positioning',
          tagline:
            '"Give the signal, and I\'ll drop those troopers like mynocks."',
          cost: 4
        },
        {
          name: 'Rebel Elite',
          tagline:
            '"I\'ve seen deployment in cities, deserts and forest moons; I go where I\'m needed."',
          cost: 4
        }
      ]
    }
  }
})
await prisma.class.create({
  data: {
    expansionId: core.id,
    name: dialaPassil.name,
    side: Side.REBEL,
    heroId: dialaPassil.id,
    cards: {
      create: [
        {
          name: 'Plasteel Staff',
          tagline: 'Subtle and versatile in equal measure.',
          cost: 0
        },
        {
          name: 'Force Throw',
          tagline:
            '"Do... or do not. There is no try."\n—Yoda, The Empire Strikes Back',
          cost: 1
        },
        {
          name: 'Force Adept',
          tagline: '"Luck has very little to do with it."',
          cost: 1
        },
        {
          name: 'Defensive Stance',
          tagline:
            '"A master of the Resilience Form is invincible. One who aspires to it, such as myself, is simply very hard to kill."',
          cost: 2
        },
        {
          name: 'Battle Meditation',
          tagline:
            '"A war is not a duel. We must rely upon each other if we hope to win."',
          cost: 2
        },
        {
          name: 'Snap Kick',
          tagline: '"Footwork is key to any combat form."',
          cost: 3
        },
        {
          name: 'Art of Movement',
          tagline:
            '"My master taught me how to be swift. It did not save him, but I shall not forget his teachings."',
          cost: 3
        },
        {
          name: 'Way of the Sarlacc',
          tagline: '"Engage me at your peril."',
          cost: 4
        },
        {
          name: 'Dancing Weapon',
          tagline: '"It\'s all in the wrist."',
          cost: 4
        }
      ]
    }
  }
})
await prisma.class.create({
  data: {
    expansionId: core.id,
    name: gideonArgus.name,
    side: Side.REBEL,
    heroId: gideonArgus.id,
    cards: {
      create: [
        {
          name: 'Holdout Blaster',
          tagline: 'An anniversary gift.',
          cost: 0
        },
        {
          name: 'Military Efficiency',
          tagline: '"This old dog is no stranger to new tricks."',
          cost: 1
        },
        {
          name: 'Called Shot',
          tagline: '"On my signal."',
          cost: 1
        },
        {
          name: 'Air of Command',
          tagline: '"Respect is earned, not granted."',
          cost: 2
        },
        {
          name: 'Mobile Tactician',
          tagline: '"It\'s not as easy to keep up as it used to be."',
          cost: 2
        },
        {
          name: 'For the Cause!',
          tagline:
            '"The pursuit of freedom can drive a soldier to incredible things."',
          cost: 3
        },
        {
          name: 'Rallying Shout',
          tagline: '"Never surrender."',
          cost: 3
        },
        {
          name: 'Hammer and Anvil',
          cost: 4
        },
        {
          name: 'Masterstroke',
          tagline: '"Expect nothing. Anticipate everything."',
          cost: 4
        }
      ]
    }
  }
})
await prisma.class.create({
  data: {
    expansionId: core.id,
    name: makEshkarey.name,
    side: Side.REBEL,
    heroId: makEshkarey.id,
    cards: {
      create: [
        {
          name: 'Longblaster',
          tagline: 'An illegally modified Sporting Blaster.',
          cost: 0
        },
        {
          name: 'Disengage',
          tagline:
            '"The Imperial military police couldn\'t take me alive, and neither will you!"',
          cost: 1
        },
        {
          name: 'Supply Network',
          tagline: '"It must be my birthday."',
          cost: 1
        },
        {
          name: 'Jeswandi Training',
          tagline:
            '"Ancient Bothans developed the meditative art of Jeswandi to find focus, even in the midst of battle."',
          cost: 2
        },
        {
          name: 'Target Acquired',
          tagline: '"Ha! I bet even a Jedi couldn\'t make that shot."',
          cost: 2
        },
        {
          name: 'Expertise',
          tagline:
            '"I\'d rather not waste any time when there\'s troopers I could be putting holes in."',
          cost: 3
        },
        {
          name: 'Execute',
          tagline:
            '"Ten credits says I can thread a blaster bolt right between his teeth."',
          cost: 3
        },
        {
          name: 'No Escape',
          tagline: '"...and stay down."',
          cost: 4
        },
        {
          name: 'Decoy',
          tagline: '"Watch carefully. Most folks only see this trick once."',
          cost: 4
        }
      ]
    }
  }
})
await prisma.class.create({
  data: {
    expansionId: core.id,
    name: gaarkhan.name,
    side: Side.REBEL,
    heroId: gaarkhan.id,
    cards: {
      create: [
        {
          name: 'Vibro-Ax',
          tagline: '"Muaarga." (Peace)',
          cost: 0
        },
        {
          name: 'Wookiee Loyalty',
          tagline: 'The friendship of a Wookiee is more valuable than armor.',
          cost: 1
        },
        {
          name: 'Wookiee Fortitude',
          tagline:
            '"Set for stun" is a startlingly optimistic gesture when fighting Wookiees.',
          cost: 1
        },
        {
          name: 'Ferocity',
          tagline:
            'A Wookiee tends to channel his anger in a very direct and practical manner.',
          cost: 2
        },
        {
          name: 'Staggering Blow',
          tagline:
            '"The first swing is just to throw you off-balance. The second hit is the killer."',
          cost: 2
        },
        {
          name: 'Vicious Strike',
          tagline: '"Yuow." (Goodbye.)',
          cost: 3
        },
        {
          name: 'Rampage',
          tagline:
            '"Fighting a Wookiee is a lot like being in a landspeeder crash: dangerous, terrifying, and very loud."',
          cost: 3
        },
        {
          name: 'Unstoppable',
          tagline:
            'Mass multiplied by velocity equals momentum. A Wookiee packs plenty of both.',
          cost: 4
        },
        {
          name: 'Brutal Cleave',
          tagline:
            'Underneath that fur is a few hundred pounds of solid muscle and anger.',
          cost: 4
        }
      ]
    }
  }
})
await prisma.class.create({
  data: {
    expansionId: core.id,
    name: jynOdan.name,
    side: Side.REBEL,
    heroId: jynOdan.id,
    cards: {
      create: [
        {
          name: 'Vintage Blaster',
          tagline: 'It\'s engraved with the words: "Think fast."',
          cost: 0
        },
        {
          name: "Smuggler's Luck",
          tagline: '',
          cost: 1
        },
        {
          name: 'Quick As A Whip',
          tagline: '"Try to keep up."',
          cost: 1
        },
        {
          name: 'Cheap Shot',
          tagline: '"I prefer to think of it as a \'Bargain Shot\'."',
          cost: 2
        },
        {
          name: 'Roll With It',
          tagline:
            '"If I had a credit for every blaster bold they\'ve shot at us, I\'d buy my own moon."',
          cost: 2
        },
        {
          name: 'Gunslinger',
          tagline: '"Come on, dance for me."',
          cost: 3
        },
        {
          name: 'Get Cocky',
          tagline: '"I don\'t mean to brag; I just happen to be amazing."',
          cost: 3
        },
        {
          name: 'Trick Shot',
          tagline: '"Bet you didn\'t see that coming."',
          cost: 4
        },
        {
          name: 'Sidewinder',
          tagline: '"You can\'t hit what you can\'t catch."',
          cost: 4
        }
      ]
    }
  }
})
await prisma.class.create({
  data: {
    expansionId: core.id,
    name: 'Technological Superiority',
    side: Side.IMPERIAL,
    cards: {
      create: [
        {
          name: 'Experimental Arms',
          cost: 0
        },
        {
          name: 'Technical Support',
          cost: 1
        },
        {
          name: 'Jetpacks',
          cost: 1
        },
        {
          name: 'Failsafe',
          cost: 2
        },
        {
          name: 'Hidden Detonators',
          cost: 2
        },
        {
          name: 'Cloaking Device',
          cost: 3
        },
        {
          name: 'Arc Blasters',
          cost: 3
        },
        {
          name: 'Superior Augments',
          cost: 4
        },
        {
          name: 'Adaptive Weapons',
          cost: 4
        }
      ]
    }
  }
})
await prisma.class.create({
  data: {
    expansionId: core.id,
    name: 'Subversive Tactics',
    side: Side.IMPERIAL,
    cards: {
      create: [
        {
          name: 'Prey Upon Doubt',
          cost: 0
        },
        {
          name: 'Savage Weaponry',
          cost: 1
        },
        {
          name: 'Surgical Strike',
          cost: 1
        },
        {
          name: 'Heavy Pressure',
          cost: 2
        },
        {
          name: 'Exploit Weakness',
          cost: 2
        },
        {
          name: 'Executioner',
          cost: 3
        },
        {
          name: 'Weary Target',
          cost: 3
        },
        {
          name: 'Oppression',
          cost: 4
        },
        {
          name: 'No Quarter',
          cost: 4
        }
      ]
    }
  }
})
await prisma.class.create({
  data: {
    expansionId: core.id,
    name: 'Military Might',
    side: Side.IMPERIAL,
    cards: {
      create: [
        {
          name: 'Show of Force',
          cost: 0
        },
        {
          name: 'Riot Grenades',
          cost: 1
        },
        {
          name: 'Combat Medic',
          cost: 1
        },
        {
          name: 'Assault Armor',
          cost: 2
        },
        {
          name: 'Endless Ranks',
          cost: 2
        },
        {
          name: 'Sustained Fire',
          cost: 3
        },
        {
          name: 'Shock Troopers',
          cost: 3
        },
        {
          name: 'Shock and Awe',
          cost: 4
        },
        {
          name: 'Combat Veterans',
          cost: 4
        }
      ]
    }
  }
})
console.log('Seeded classes')

// agendas
await prisma.agendaDeck.create({
  data: {
    expansionId: core.id,
    name: 'Imperial Security Bureau',
    agendas: {
      create: [
        {
          name: 'ISB Enforcers',
          tagline:
            'The ISB will draft promising members of the Stormtrooper Corps to serve as enforcers in times of need. These troopers are given special training and enhanced weaponry for ISB assignments.',
          cost: 2
        },
        {
          name: 'Imperial Operative',
          tagline:
            'The most skilled Imperial operatives are as dangerous in combat as they are brilliant in command.',
          cost: 1
        },
        {
          name: 'Internal Affairs',
          tagline:
            'The ISB has sent special agents to help secure and maintain Imperial garrisons across the galaxy.',
          cost: 2
        }
      ]
    }
  }
})
await prisma.agendaDeck.create({
  data: {
    expansionId: core.id,
    name: 'Imperial Industry',
    agendas: {
      create: [
        {
          name: 'Restorative Supplies',
          tagline:
            'Stocking up on bacta and other vital supplies will undoubtedly provide an edge to the soldiers on the ground.',
          cost: 2
        },
        {
          name: 'Means of Production',
          tagline:
            'An Imperial testing facility has made a recent breakthrough. With support, their deadly innovations could be put to work very soon.',
          cost: 3,
          mission: {
            create: {
              missionId: meansOfProduction.id
            }
          }
        },
        {
          name: 'Interrogation Protocol',
          tagline:
            'Many Imperial Droids are enhanced with unique modifications, publicly known as "enhanced persuasion mechanisms."',
          cost: 1
        }
      ]
    }
  }
})
await prisma.agendaDeck.create({
  data: {
    expansionId: core.id,
    name: 'Retaliation',
    agendas: {
      create: [
        {
          name: 'Tactical Explosives',
          tagline:
            'A well-placed explosion can turn the tide of any battle. Be it a grenade, proximity mines, or orbital bombardement, the Rebellion will not expect this.',
          cost: 1
        },
        {
          name: 'Weakness Revealed',
          tagline:
            'A single link can break the chain. It is advantageous to isolate and execute vulnerable Rebel operatives.',
          cost: 2
        },
        {
          name: 'Breaking Point',
          tagline:
            "Imperial operatives conduct surgical strikes to destroy the Rebellion's vital supplies. Weaken them, and their surrender is all but assured.",
          cost: 3,
          mission: {
            create: {
              missionId: breakingPoint.id
            }
          }
        }
      ]
    }
  }
})
await prisma.agendaDeck.create({
  data: {
    expansionId: core.id,
    name: 'Imperial Discipline',
    agendas: {
      create: [
        {
          name: 'Impending Doom',
          tagline:
            'There is nothing that boosts Imperial morale more than watching Rebel soldiers fall before their might.',
          cost: 1
        },
        {
          name: 'Tactical Maneuvering',
          tagline:
            'From TIE fighters to speeder-bikes, the Empire has always placed a high value on mobility. This principle remains true even among their ground forces.',
          cost: 1
        },
        {
          name: 'Fire at Will',
          tagline: 'Strike when they least expect it.',
          cost: 2
        }
      ]
    }
  }
})
await prisma.agendaDeck.create({
  data: {
    expansionId: core.id,
    name: 'Agents of the Empire',
    agendas: {
      create: [
        {
          name: 'Impounded',
          tagline:
            "The vessel has proper authorization, but its crew are known Rebel sympathizers. Interrogating them and stripping their ship's data files could provide important intelligence.\nThese are dangerous criminals, not to be underestimated. With a few measures of subtlety, perhaps the information could be gained without direct conflict...",
          cost: 4,
          mission: {
            create: {
              forced: true,
              missionId: impounded.id
            }
          }
        },
        {
          name: 'Tracking Beacon',
          tagline:
            'In monitoring the movements of the Rebel forces, the Empire can press its advantages with little threat of reprisal.',
          cost: 1
        },
        {
          name: 'Imperial Informants',
          tagline:
            "The Empire's web of spies and double-agents allows for a more rapid response to emergency situations.",
          cost: 1
        }
      ]
    }
  }
})
await prisma.agendaDeck.create({
  data: {
    expansionId: core.id,
    name: 'For the Right Price',
    agendas: {
      create: [
        {
          name: 'High-Value Target',
          tagline:
            'Imperial High Command authorizes increased military presence when a high-value Rebel asset is detected in the field.',
          cost: 2
        },
        {
          name: 'Wanted',
          tagline:
            "Rebel operatives are proving to be a thorn in the Empire's side. Working with mercenaries can be distasteful, but a sizable bounty could place considerable pressure upon them.\nThese Rebels are dangerous foes. Advise the hunter to create a tactical advantage before confronting them directly.",
          cost: 4,
          mission: {
            create: {
              forced: true,
              missionId: wanted.id
            }
          }
        },
        {
          name: 'Hired Help',
          tagline:
            'Choose any target you wish. As long as you pay credits to equal the risk, someone will be willing to take on the job.',
          cost: 1
        }
      ]
    }
  }
})
await prisma.agendaDeck.create({
  data: {
    expansionId: core.id,
    name: "Lord Vader's Command",
    agendas: {
      create: [
        {
          name: 'A Dark Power',
          tagline:
            "The Empire's destructive power cannot be contained. Its forces spread across the galaxy with unrelenting force.",
          cost: 2
        },
        {
          name: 'As You Wish',
          tagline:
            'The mere presence of Darth Vader is often enough to turn the tide of a battle. His combat prowess is unparalleled, and his skill with a Lightsaber is terrifying to behold.',
          cost: 1
        },
        {
          name: 'Dark Obsession',
          tagline: 'Darth Vader',
          cost: 3,
          mission: {
            create: {
              missionId: darkObsession.id
            }
          }
        }
      ]
    }
  }
})
console.log('Seeded agendas')

// campaigns
const campaign = await prisma.campaign.create({
  data: {
    expansionId: core.id,
    name: 'Core',
    period: 3,
    startId: aftermath.id
  },
  select: {
    id: true
  }
})
console.log('Seeded campaigns')

// mission slots
await prisma.missionSlot.createMany({
  data: [
    {
      campaignId: campaign.id,
      index: 0,
      type: MissionSlotType.STORY,
      threat: 2,
      itemTiers: [1]
    },
    {
      campaignId: campaign.id,
      index: 1,
      type: MissionSlotType.SIDE,
      threat: 2,
      itemTiers: [1]
    },
    {
      campaignId: campaign.id,
      index: 2,
      type: MissionSlotType.STORY,
      threat: 3,
      itemTiers: [1]
    },
    {
      campaignId: campaign.id,
      index: 3,
      type: MissionSlotType.SIDE,
      threat: 3,
      itemTiers: [1, 2]
    },
    {
      campaignId: campaign.id,
      index: 4,
      type: MissionSlotType.STORY,
      threat: 4,
      itemTiers: [2]
    },
    {
      campaignId: campaign.id,
      index: 5,
      type: MissionSlotType.SIDE,
      threat: 4,
      itemTiers: [2]
    },
    {
      campaignId: campaign.id,
      index: 6,
      type: MissionSlotType.SIDE,
      threat: 4,
      itemTiers: [2, 3]
    },
    {
      campaignId: campaign.id,
      index: 7,
      type: MissionSlotType.STORY,
      threat: 5,
      itemTiers: [3]
    },
    {
      campaignId: campaign.id,
      index: 8,
      type: MissionSlotType.SIDE,
      threat: 5,
      itemTiers: [3]
    },
    {
      campaignId: campaign.id,
      index: 9,
      type: MissionSlotType.STORY,
      threat: 6,
      itemTiers: [3]
    },
    {
      campaignId: campaign.id,
      index: 10,
      type: MissionSlotType.STORY,
      threat: 6
    }
  ]
})
console.log('Seeded mission slots')

// reward placeholders
await prisma.rewardPlaceholder.createMany({
  data: [
    {
      campaignId: campaign.id,
      name: 'claimed',
      label: 'Claimed Mission Tokens',
      status: MissionRewardType.ALL,
      type: 'number',
      validation: {
        min: 0,
        max: 12,
        step: 1
      },
      missionId: generousDonations.id
    },
    {
      campaignId: campaign.id,
      name: 'terminal',
      label: 'Terminal Secured Before End of Round 6',
      type: 'boolean',
      status: MissionRewardType.ALL,
      missionId: theSource.id
    },
    {
      campaignId: campaign.id,
      name: 'officer',
      label: 'Officer Freed Before Security Station Door Opened',
      type: 'boolean',
      status: MissionRewardType.ALL,
      missionId: theSource.id
    },
    {
      campaignId: campaign.id,
      name: 'weiss',
      label: 'Weiss Defeated Before Entering AT-ST',
      type: 'boolean',
      status: MissionRewardType.ALL,
      missionId: chainOfCommand.id
    },
    {
      campaignId: campaign.id,
      name: 'departed',
      label: 'Heroes Departed and "Raise the Alarms" Did Not Trigger',
      type: 'boolean',
      status: MissionRewardType.ALL,
      missionId: drawnIn.id
    },
    {
      campaignId: campaign.id,
      name: 'passage',
      label: 'Passage Opened Before End of Round 5',
      type: 'boolean',
      status: MissionRewardType.ALL,
      missionId: incoming.id
    },
    {
      campaignId: campaign.id,
      name: 'escape',
      label: '"Daring Escape" Triggered',
      type: 'boolean',
      status: MissionRewardType.ALL,
      missionId: flySolo.id
    },
    {
      campaignId: campaign.id,
      name: 'terminal',
      label: 'Terminal Destroyed',
      type: 'boolean',
      status: MissionRewardType.ALL,
      missionId: imperialHospitality.id
    },
    {
      campaignId: campaign.id,
      name: 'secured',
      label: '4 Capture Points Secured Before End of Round 6',
      type: 'boolean',
      status: MissionRewardType.LOSS,
      missionId: underSiege.id
    }
  ]
})
console.log('Seeded reward placeholders')

// mission rewards
await prisma.missionReward.createMany({
  data: [
    {
      campaignId: campaign.id,
      missionId: darkObsession.id,
      type: MissionRewardType.WIN,
      side: Side.REBEL,
      credits: 100
    },
    {
      campaignId: campaign.id,
      missionId: darkObsession.id,
      type: MissionRewardType.LOSS,
      side: Side.IMPERIAL,
      troopId: (await prisma.troop.findFirst({
        where: {
          expansionId: core.id,
          name: 'Darth Vader (Lord of the Sith)'
        }
      })).id
    },
    {
      campaignId: campaign.id,
      missionId: darkObsession.id,
      type: MissionRewardType.ALL,
      side: Side.ALL,
      xp: 1,
      credits: 100,
      influence: 1
    },
    {
      campaignId: campaign.id,
      missionId: wanted.id,
      type: MissionRewardType.LOSS,
      side: Side.IMPERIAL,
      rewardId: (await prisma.reward.findFirst({
        where: {
          expansionId: core.id,
          name: 'Old Wounds'
        }
      })).id
    },
    {
      campaignId: campaign.id,
      missionId: impounded.id,
      type: MissionRewardType.LOSS,
      side: Side.IMPERIAL,
      rewardId: (await prisma.reward.findFirst({
        where: {
          expansionId: core.id,
          name: 'Special Operations'
        }
      })).id
    },
    {
      campaignId: campaign.id,
      missionId: breakingPoint.id,
      type: MissionRewardType.WIN,
      side: Side.REBEL,
      credits: 100
    },
    {
      campaignId: campaign.id,
      missionId: breakingPoint.id,
      type: MissionRewardType.LOSS,
      side: Side.IMPERIAL,
      rewardId: (await prisma.reward.findFirst({
        where: {
          expansionId: core.id,
          name: 'Supply Deficit'
        }
      })).id
    },
    {
      campaignId: campaign.id,
      missionId: breakingPoint.id,
      type: MissionRewardType.ALL,
      side: Side.ALL,
      xp: 1,
      credits: 100,
      influence: 1
    },
    {
      campaignId: campaign.id,
      missionId: meansOfProduction.id,
      type: MissionRewardType.WIN,
      side: Side.REBEL,
      credits: 100
    },
    {
      campaignId: campaign.id,
      missionId: meansOfProduction.id,
      type: MissionRewardType.LOSS,
      side: Side.IMPERIAL,
      rewardId: (await prisma.reward.findFirst({
        where: {
          expansionId: core.id,
          name: 'Imperial Industry'
        }
      })).id
    },
    {
      campaignId: campaign.id,
      missionId: meansOfProduction.id,
      type: MissionRewardType.ALL,
      side: Side.ALL,
      xp: 1,
      credits: 100,
      influence: 1
    },
    {
      campaignId: campaign.id,
      missionId: captured.id,
      type: MissionRewardType.LOSS,
      side: Side.IMPERIAL,
      influence: 2
    },
    {
      campaignId: campaign.id,
      missionId: brushfire.id,
      type: MissionRewardType.WIN,
      side: Side.REBEL,
      rewardId: (await prisma.reward.findFirst({
        where: {
          expansionId: core.id,
          name: 'Veteran Prowess'
        }
      })).id
    },
    {
      campaignId: campaign.id,
      missionId: brushfire.id,
      type: MissionRewardType.LOSS,
      side: Side.IMPERIAL,
      influence: 2
    },
    {
      campaignId: campaign.id,
      missionId: brushfire.id,
      type: MissionRewardType.ALL,
      side: Side.ALL,
      xp: 1,
      credits: 100,
      influence: 1
    },
    {
      campaignId: campaign.id,
      missionId: temptation.id,
      type: MissionRewardType.WIN,
      side: Side.REBEL,
      rewardId: (await prisma.reward.findFirst({
        where: {
          expansionId: core.id,
          name: "Shu Yen's Lightsaber"
        }
      })).id
    },
    {
      campaignId: campaign.id,
      missionId: temptation.id,
      type: MissionRewardType.LOSS,
      side: Side.IMPERIAL,
      influence: 2
    },
    {
      campaignId: campaign.id,
      missionId: temptation.id,
      type: MissionRewardType.ALL,
      side: Side.ALL,
      xp: 1,
      credits: 100,
      influence: 1
    },
    {
      campaignId: campaign.id,
      missionId: friendsOfOld.id,
      type: MissionRewardType.WIN,
      side: Side.REBEL,
      rewardId: (await prisma.reward.findFirst({
        where: {
          expansionId: core.id,
          name: 'Fearless Leader'
        }
      })).id
    },
    {
      campaignId: campaign.id,
      missionId: friendsOfOld.id,
      type: MissionRewardType.LOSS,
      side: Side.IMPERIAL,
      influence: 2
    },
    {
      campaignId: campaign.id,
      missionId: friendsOfOld.id,
      type: MissionRewardType.ALL,
      side: Side.ALL,
      xp: 1,
      credits: 100,
      influence: 1
    },
    {
      campaignId: campaign.id,
      missionId: looseCannon.id,
      type: MissionRewardType.WIN,
      side: Side.REBEL,
      rewardId: (await prisma.reward.findFirst({
        where: {
          expansionId: core.id,
          name: 'Shadow Suit'
        }
      })).id
    },
    {
      campaignId: campaign.id,
      missionId: looseCannon.id,
      type: MissionRewardType.LOSS,
      side: Side.IMPERIAL,
      influence: 2
    },
    {
      campaignId: campaign.id,
      missionId: looseCannon.id,
      type: MissionRewardType.ALL,
      side: Side.ALL,
      xp: 1,
      credits: 100,
      influence: 1
    },
    {
      campaignId: campaign.id,
      missionId: indebted.id,
      type: MissionRewardType.WIN,
      side: Side.REBEL,
      rewardId: (await prisma.reward.findFirst({
        where: {
          expansionId: core.id,
          name: 'Life Debt'
        }
      })).id
    },
    {
      campaignId: campaign.id,
      missionId: indebted.id,
      type: MissionRewardType.LOSS,
      side: Side.IMPERIAL,
      influence: 2
    },
    {
      campaignId: campaign.id,
      missionId: indebted.id,
      type: MissionRewardType.ALL,
      side: Side.ALL,
      xp: 1,
      credits: 100,
      influence: 1
    },
    {
      campaignId: campaign.id,
      missionId: highMoon.id,
      type: MissionRewardType.WIN,
      side: Side.REBEL,
      rewardId: (await prisma.reward.findFirst({
        where: {
          expansionId: core.id,
          name: 'Peacemaker'
        }
      })).id
    },
    {
      campaignId: campaign.id,
      missionId: highMoon.id,
      type: MissionRewardType.LOSS,
      side: Side.IMPERIAL,
      influence: 2
    },
    {
      campaignId: campaign.id,
      missionId: highMoon.id,
      type: MissionRewardType.ALL,
      side: Side.ALL,
      xp: 1,
      credits: 100,
      influence: 1
    },
    {
      campaignId: campaign.id,
      missionId: sympathyForTheRebellion.id,
      type: MissionRewardType.WIN,
      side: Side.REBEL,
      rewardId: (await prisma.reward.findFirst({
        where: {
          expansionId: core.id,
          name: 'The Ways of the Force'
        }
      })).id
    },
    {
      campaignId: campaign.id,
      missionId: sympathyForTheRebellion.id,
      type: MissionRewardType.LOSS,
      side: Side.IMPERIAL,
      influence: 2
    },
    {
      campaignId: campaign.id,
      missionId: sympathyForTheRebellion.id,
      type: MissionRewardType.ALL,
      side: Side.ALL,
      xp: 1,
      credits: 100,
      influence: 1
    },
    {
      campaignId: campaign.id,
      missionId: luxuryCruise.id,
      type: MissionRewardType.WIN,
      side: Side.REBEL,
      rewardId: (await prisma.reward.findFirst({
        where: {
          expansionId: core.id,
          name: 'Allied Operations'
        }
      })).id
    },
    {
      campaignId: campaign.id,
      missionId: luxuryCruise.id,
      type: MissionRewardType.LOSS,
      side: Side.IMPERIAL,
      influence: 2
    },
    {
      campaignId: campaign.id,
      missionId: luxuryCruise.id,
      type: MissionRewardType.ALL,
      side: Side.ALL,
      xp: 1,
      credits: 100,
      influence: 1
    },
    {
      campaignId: campaign.id,
      missionId: generousDonations.id,
      type: MissionRewardType.ALL,
      side: Side.ALL,
      xp: 1,
      credits: 100,
      influence: 1
    },
    {
      campaignId: campaign.id,
      missionId: generousDonations.id,
      type: MissionRewardType.ALL,
      side: Side.REBEL,
      credits: 100,
      multiplier: 'Math.floor({{claimed}} / 3)'
    },
    {
      campaignId: campaign.id,
      missionId: generousDonations.id,
      type: MissionRewardType.ALL,
      side: Side.IMPERIAL,
      influence: 1,
      multiplier: 'Math.floor((12 - {{claimed}}) / 3)'
    },
    {
      campaignId: campaign.id,
      missionId: aSimpleTask.id,
      type: MissionRewardType.WIN,
      side: Side.REBEL,
      rewardId: (await prisma.reward.findFirst({
        where: {
          expansionId: core.id,
          name: 'Adrenal Implant'
        }
      })).id
    },
    {
      campaignId: campaign.id,
      missionId: aSimpleTask.id,
      type: MissionRewardType.LOSS,
      side: Side.IMPERIAL,
      influence: 2
    },
    {
      campaignId: campaign.id,
      missionId: aSimpleTask.id,
      type: MissionRewardType.ALL,
      side: Side.ALL,
      xp: 1,
      credits: 100,
      influence: 1
    },
    {
      campaignId: campaign.id,
      missionId: vipersDen.id,
      type: MissionRewardType.WIN,
      side: Side.REBEL,
      rewardId: (await prisma.reward.findFirst({
        where: {
          expansionId: core.id,
          name: 'Rebel Recon'
        }
      })).id
    },
    {
      campaignId: campaign.id,
      missionId: vipersDen.id,
      type: MissionRewardType.LOSS,
      side: Side.IMPERIAL,
      influence: 2
    },
    {
      campaignId: campaign.id,
      missionId: vipersDen.id,
      type: MissionRewardType.ALL,
      side: Side.ALL,
      xp: 1,
      credits: 100,
      influence: 1
    },
    {
      campaignId: campaign.id,
      missionId: targetOfOpportunity.id,
      type: MissionRewardType.WIN,
      side: Side.REBEL,
      troopId: (await prisma.troop.findFirst({
        where: {
          expansionId: core.id,
          name: 'Rebel Saboteur'
        }
      })).id
    },
    {
      campaignId: campaign.id,
      missionId: targetOfOpportunity.id,
      type: MissionRewardType.LOSS,
      side: Side.IMPERIAL,
      influence: 2
    },
    {
      campaignId: campaign.id,
      missionId: targetOfOpportunity.id,
      type: MissionRewardType.ALL,
      side: Side.ALL,
      xp: 1,
      credits: 100,
      influence: 1
    },
    {
      campaignId: campaign.id,
      missionId: theSpiceJob.id,
      type: MissionRewardType.WIN,
      side: Side.REBEL,
      troopId: (await prisma.troop.findFirst({
        where: {
          expansionId: core.id,
          name: 'Chewbacca (Loyal Wookiee)'
        }
      })).id
    },
    {
      campaignId: campaign.id,
      missionId: theSpiceJob.id,
      type: MissionRewardType.LOSS,
      side: Side.IMPERIAL,
      influence: 2
    },
    {
      campaignId: campaign.id,
      missionId: theSpiceJob.id,
      type: MissionRewardType.ALL,
      side: Side.ALL,
      xp: 1,
      credits: 100,
      influence: 1
    },
    {
      campaignId: campaign.id,
      missionId: homecoming.id,
      type: MissionRewardType.WIN,
      side: Side.REBEL,
      troopId: (await prisma.troop.findFirst({
        where: {
          expansionId: core.id,
          name: 'Luke Skywalker (Hero of the Rebellion)'
        }
      })).id
    },
    {
      campaignId: campaign.id,
      missionId: homecoming.id,
      type: MissionRewardType.LOSS,
      side: Side.IMPERIAL,
      influence: 2
    },
    {
      campaignId: campaign.id,
      missionId: homecoming.id,
      type: MissionRewardType.ALL,
      side: Side.ALL,
      xp: 1,
      credits: 100,
      influence: 1
    },
    {
      campaignId: campaign.id,
      missionId: sorryAboutTheMess.id,
      type: MissionRewardType.WIN,
      side: Side.REBEL,
      troopId: (await prisma.troop.findFirst({
        where: {
          expansionId: core.id,
          name: 'Han Solo (Scoundrel)'
        }
      })).id
    },
    {
      campaignId: campaign.id,
      missionId: sorryAboutTheMess.id,
      type: MissionRewardType.LOSS,
      side: Side.IMPERIAL,
      influence: 2
    },
    {
      campaignId: campaign.id,
      missionId: sorryAboutTheMess.id,
      type: MissionRewardType.ALL,
      side: Side.ALL,
      xp: 1,
      credits: 100,
      influence: 1
    },
    {
      campaignId: campaign.id,
      missionId: theSource.id,
      type: MissionRewardType.WIN,
      side: Side.REBEL,
      xp: 1,
      nextMissionId: lastStand.id
    },
    {
      campaignId: campaign.id,
      missionId: theSource.id,
      type: MissionRewardType.LOSS,
      side: Side.IMPERIAL,
      xp: 1,
      nextMissionId: desperateHour.id
    },
    {
      campaignId: campaign.id,
      missionId: theSource.id,
      type: MissionRewardType.ALL,
      side: Side.ALL,
      xp: 1,
      credits: 100,
      influence: 1
    },
    {
      campaignId: campaign.id,
      missionId: theSource.id,
      type: MissionRewardType.ALL,
      side: Side.REBEL,
      credits: 100,
      condition: '{{terminal}}'
    },
    {
      campaignId: campaign.id,
      missionId: theSource.id,
      type: MissionRewardType.ALL,
      side: Side.IMPERIAL,
      influence: 1,
      condition: '{{officer}}'
    },
    {
      campaignId: campaign.id,
      missionId: chainOfCommand.id,
      type: MissionRewardType.WIN,
      side: Side.REBEL,
      xp: 1,
      nextMissionId: lastStand.id
    },
    {
      campaignId: campaign.id,
      missionId: chainOfCommand.id,
      type: MissionRewardType.LOSS,
      side: Side.IMPERIAL,
      xp: 1,
      nextMissionId: desperateHour.id
    },
    {
      campaignId: campaign.id,
      missionId: chainOfCommand.id,
      type: MissionRewardType.ALL,
      side: Side.ALL,
      xp: 1,
      credits: 100,
      influence: 1
    },
    {
      campaignId: campaign.id,
      missionId: chainOfCommand.id,
      type: MissionRewardType.ALL,
      side: Side.REBEL,
      credits: 100,
      condition: '{{weiss}}'
    },
    {
      campaignId: campaign.id,
      missionId: chainOfCommand.id,
      type: MissionRewardType.ALL,
      side: Side.IMPERIAL,
      influence: 1,
      condition: '!{{weiss}}'
    },
    {
      campaignId: campaign.id,
      missionId: drawnIn.id,
      type: MissionRewardType.WIN,
      side: Side.REBEL,
      xp: 1,
      nextMissionId: chainOfCommand.id
    },
    {
      campaignId: campaign.id,
      missionId: drawnIn.id,
      type: MissionRewardType.LOSS,
      side: Side.IMPERIAL,
      xp: 1,
      nextMissionId: theSource.id,
      forcedMissionId: captured.id
    },
    {
      campaignId: campaign.id,
      missionId: drawnIn.id,
      type: MissionRewardType.ALL,
      side: Side.ALL,
      xp: 1,
      credits: 100,
      influence: 1
    },
    {
      campaignId: campaign.id,
      missionId: drawnIn.id,
      type: MissionRewardType.ALL,
      side: Side.REBEL,
      credits: 100,
      condition: '{{departed}}'
    },
    {
      campaignId: campaign.id,
      missionId: drawnIn.id,
      type: MissionRewardType.ALL,
      side: Side.IMPERIAL,
      influence: 1,
      condition: '!{{departed}}'
    },
    {
      campaignId: campaign.id,
      missionId: incoming.id,
      type: MissionRewardType.WIN,
      side: Side.REBEL,
      xp: 1,
      nextMissionId: chainOfCommand.id
    },
    {
      campaignId: campaign.id,
      missionId: incoming.id,
      type: MissionRewardType.LOSS,
      side: Side.IMPERIAL,
      xp: 1,
      nextMissionId: theSource.id,
      forcedMissionId: captured.id
    },
    {
      campaignId: campaign.id,
      missionId: incoming.id,
      type: MissionRewardType.ALL,
      side: Side.ALL,
      xp: 1,
      credits: 100,
      influence: 1
    },
    {
      campaignId: campaign.id,
      missionId: incoming.id,
      type: MissionRewardType.ALL,
      side: Side.REBEL,
      credits: 100,
      condition: '{{passage}}'
    },
    {
      campaignId: campaign.id,
      missionId: incoming.id,
      type: MissionRewardType.ALL,
      side: Side.IMPERIAL,
      influence: 1,
      condition: '!{{passage}}'
    },
    {
      campaignId: campaign.id,
      missionId: flySolo.id,
      type: MissionRewardType.WIN,
      side: Side.REBEL,
      xp: 1,
      nextMissionId: incoming.id
    },
    {
      campaignId: campaign.id,
      missionId: flySolo.id,
      type: MissionRewardType.LOSS,
      side: Side.IMPERIAL,
      xp: 1,
      nextMissionId: drawnIn.id
    },
    {
      campaignId: campaign.id,
      missionId: flySolo.id,
      type: MissionRewardType.ALL,
      side: Side.ALL,
      xp: 1,
      credits: 100,
      influence: 1
    },
    {
      campaignId: campaign.id,
      missionId: flySolo.id,
      type: MissionRewardType.ALL,
      side: Side.REBEL,
      credits: 100,
      condition: '!{{escape}}'
    },
    {
      campaignId: campaign.id,
      missionId: flySolo.id,
      type: MissionRewardType.ALL,
      side: Side.IMPERIAL,
      influence: 1,
      condition: '{{escape}}'
    },
    {
      campaignId: campaign.id,
      missionId: imperialHospitality.id,
      type: MissionRewardType.WIN,
      side: Side.REBEL,
      xp: 1,
      nextMissionId: incoming.id
    },
    {
      campaignId: campaign.id,
      missionId: imperialHospitality.id,
      type: MissionRewardType.LOSS,
      side: Side.IMPERIAL,
      xp: 1,
      nextMissionId: drawnIn.id
    },
    {
      campaignId: campaign.id,
      missionId: imperialHospitality.id,
      type: MissionRewardType.ALL,
      side: Side.ALL,
      xp: 1,
      credits: 100,
      influence: 1
    },
    {
      campaignId: campaign.id,
      missionId: imperialHospitality.id,
      type: MissionRewardType.ALL,
      side: Side.REBEL,
      credits: 100,
      condition: '{{terminal}}'
    },
    {
      campaignId: campaign.id,
      missionId: imperialHospitality.id,
      type: MissionRewardType.ALL,
      side: Side.IMPERIAL,
      influence: 1,
      condition: '!{{terminal}}'
    },
    {
      campaignId: campaign.id,
      missionId: underSiege.id,
      type: MissionRewardType.WIN,
      side: Side.REBEL,
      xp: 1,
      credits: 100,
      nextMissionId: imperialHospitality.id
    },
    {
      campaignId: campaign.id,
      missionId: underSiege.id,
      type: MissionRewardType.LOSS,
      side: Side.ALL,
      xp: 1,
      nextMissionId: imperialHospitality.id,
      condition: '!{{secured}}'
    },
    {
      campaignId: campaign.id,
      missionId: underSiege.id,
      type: MissionRewardType.LOSS,
      side: Side.IMPERIAL,
      xp: 1,
      influence: 1,
      nextMissionId: flySolo.id,
      condition: '{{secured}}'
    },
    {
      campaignId: campaign.id,
      missionId: underSiege.id,
      type: MissionRewardType.ALL,
      side: Side.ALL,
      xp: 1,
      credits: 100,
      influence: 1
    },
    {
      campaignId: campaign.id,
      missionId: aNewThreat.id,
      type: MissionRewardType.WIN,
      side: Side.REBEL,
      xp: 1,
      nextMissionId: imperialHospitality.id
    },
    {
      campaignId: campaign.id,
      missionId: aNewThreat.id,
      type: MissionRewardType.LOSS,
      side: Side.IMPERIAL,
      xp: 1,
      nextMissionId: flySolo.id
    },
    {
      campaignId: campaign.id,
      missionId: aNewThreat.id,
      type: MissionRewardType.ALL,
      side: Side.ALL,
      xp: 1,
      credits: 100,
      influence: 1
    },
    {
      campaignId: campaign.id,
      missionId: aNewThreat.id,
      type: MissionRewardType.ALL,
      side: Side.REBEL,
      credits: 100,
      condition: '{{terminals}}'
    },
    {
      campaignId: campaign.id,
      missionId: aNewThreat.id,
      type: MissionRewardType.ALL,
      side: Side.IMPERIAL,
      influence: 1,
      condition: '!{{terminals}}'
    },
    {
      campaignId: campaign.id,
      missionId: aftermath.id,
      type: MissionRewardType.WIN,
      side: Side.REBEL,
      credits: 100,
      nextMissionId: aNewThreat.id
    },
    {
      campaignId: campaign.id,
      missionId: aftermath.id,
      type: MissionRewardType.LOSS,
      side: Side.IMPERIAL,
      influence: 1,
      nextMissionId: underSiege.id
    },
    {
      campaignId: campaign.id,
      missionId: aftermath.id,
      type: MissionRewardType.ALL,
      side: Side.ALL,
      xp: 1,
      credits: 100,
      influence: 1
    }
  ]
})
console.log('Seeded mission rewards')

await prisma.$disconnect()
